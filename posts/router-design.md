---
title: "Router 설계: 동기와 비동기 사이에서 균형 잡기"
description: GoVail Router가 Gateway를 통과한 요청을 어떤 기준으로 동기 LLM 릴레이와 비동기 Runtime 트리거로 분기하는지, 그리고 SSE Keep-alive 설계를 통해 GCP 타임아웃을 어떻게 극복했는지 기록합니다.
---

# Router 설계: 동기와 비동기 사이에서 균형 잡기

GoVail 초기 설계에서 Gateway는 LiteLLM과 직접 연결되어 있었습니다. 단순하고 명쾌했습니다. 하지만 한 가지 문제가 생겼습니다.

> "이 요청은 즉시 LLM 응답을 돌려줘야 하는가, 아니면 사람의 승인을 받고 나서 실행되어야 하는가?"

이 질문에 답하는 로직을 Gateway에 넣기 시작하자, Gateway의 핵심 속성인 **단순함**이 무너지는 것을 느꼈습니다. 그래서 Gateway와 LiteLLM 사이에 새로운 레이어를 하나 끼워 넣기로 했습니다. 그것이 **GoVail Router**입니다.

---

## 1. Router가 존재하는 이유

Gateway는 "통과시키느냐, 막느냐"만 판단합니다. 하지만 통과된 요청이라고 해서 모두 같은 방식으로 처리되는 것은 아닙니다.

```text
[Gateway 통과 후 Router 진입]

요청 분류 판단
├── 동기 LLM 응답이 필요한가?
│   └─► LiteLLM 릴레이 → 즉시 응답 반환
│
└── 비동기 장기 작업이 필요한가?
    └─► Runtime 트리거 → 202 Accepted 반환
        └─► Runner가 단계별 실행 후 결과 감사 로그
```

이 분기 판단을 Gateway가 하면, Gateway는 더 이상 Stateless한 단순 필터가 아니게 됩니다. 그래서 Router를 별도 컴포넌트로 분리했습니다.

---

## 2. 동기 릴레이 경로: LiteLLM 프록시 연동

Router의 가장 일반적인 경로는 단순 릴레이입니다. Gateway로부터 요청을 받아 LiteLLM에 그대로 전달하고, 응답을 클라이언트에 돌려줍니다.

이 과정에서 Router는 **GoVail Memory**에 먼저 들러 프로젝트 RAG 컨텍스트를 조회하고, 이를 요청 앞부분에 시스템 프롬프트 형태로 주입합니다.

```text
Client → Gateway → Router
                     │
                     ├─ Memory에 RAG 조회
                     │   └─ 관련 프로젝트 문서 컨텍스트 반환
                     │
                     └─ 컨텍스트 주입된 요청 → LiteLLM → LLM
                                                          │
                                              Client ←── 응답
```

---

## 3. SSE Keep-alive: GCP 타임아웃과의 싸움

LLM 스트리밍 응답을 클라이언트에 SSE(Server-Sent Events)로 릴레이하는 것은 쉬워 보이지만, **GCP 환경에서 예상치 못한 타임아웃** 문제가 발생했습니다.

GCP 로드밸런서는 백엔드 응답이 일정 시간 동안 아무 데이터도 내려보내지 않으면 연결을 강제로 끊어버립니다. LLM이 응답을 생성하는 동안 발생하는 "생각하는 시간(thinking time)"이 이 타임아웃을 유발했습니다.

### 해결책: Keep-alive 하트비트 주입

Router는 LLM 응답을 기다리는 동안 주기적으로 빈 SSE 하트비트 이벤트를 클라이언트에 먼저 내려보냅니다. 이를 통해 GCP 로드밸런서가 연결이 살아있다고 인식하게 합니다.

```python
# 개념적 구조
async def relay_with_keepalive(request, llm_stream):
    # LLM 응답을 기다리는 동안 주기적으로 하트비트 전송
    async def generate():
        heartbeat_task = asyncio.create_task(send_heartbeats())
        async for chunk in llm_stream:
            heartbeat_task.cancel()
            yield chunk
            heartbeat_task = asyncio.create_task(send_heartbeats())
```

이 방식은 클라이언트 SDK와의 호환성을 유지하면서도 GCP 환경의 제약을 우회하는 실용적인 해결책이었습니다.

---

## 4. 비동기 경로: Runtime 트리거

파일 수정, 터미널 실행, 외부 시스템 연동처럼 "사람의 눈이 한 번 더 봐야 하는" 작업은 Router가 Runtime에 위임합니다.

Router는 요청을 분석하여 Runner Control Protocol 형식의 Task Spec으로 변환하고, Runtime에 작업을 큐잉합니다. 클라이언트에는 즉시 `202 Accepted`와 작업 ID를 반환합니다.

```text
Router → Runtime (Task Spec 전달)
           │
           └─ 작업 시작 감사 로그
           └─ 단계별 실행 (NovelPipeline)
           └─ 승인 필요 시 Approval UI / Slack 알림
           └─ 실행 완료 감사 로그
```

클라이언트는 작업 ID를 통해 별도로 상태를 폴링하거나, Runtime이 완료 이벤트를 푸시하는 방식으로 결과를 수신합니다.

---

## 5. 현재 상태와 앞으로의 과제

GoVail Router는 현재 E2E 플로우가 구현되어 있습니다. 동기 릴레이와 비동기 Runtime 트리거, SSE Keep-alive가 실제로 동작하는 수준입니다.

남아 있는 과제는 **"어떤 기준으로 동기/비동기를 판별할 것인가"**의 정교화입니다. 현재는 요청의 경로(endpoint)나 명시적인 플래그를 기준으로 분기하지만, 향후에는 프롬프트 내용을 분석하여 자동으로 분류하는 방향도 고려하고 있습니다.
