---
layout: home

hero:
  name: "GoVail"
  text: "AI 보안 레이어 개발 기록"
  tagline: "LLM Gateway · 보안 정책 · RAG 파이프라인 — 설계부터 구현까지"
  actions:
    - theme: brand
      text: 아키텍처 보기
      link: /posts/architecture
    - theme: alt
      text: GitHub
      link: https://github.com/GoVail

features:
  - icon: 🛡️
    title: GoVail Gateway
    details: OpenAI 호환 트래픽 최전선에서 DLP 스캔, API Key 인증, 모델 Allowlist 검사를 처리하는 Rust/Axum 프록시. 10ms 이내 Stateless 처리를 목표로 설계.
    link: /posts/architecture
    linkText: 아키텍처 보기
  - icon: 🔀
    title: GoVail Router
    details: Gateway를 통과한 요청을 LLM 동기 릴레이와 Runtime 비동기 트리거로 분기하는 Python/FastAPI 라우터. GCP 환경 SSE Keep-alive 하트비트 주입으로 타임아웃 방지.
    link: /posts/router-design
    linkText: 설계 기록
  - icon: 🧠
    title: GoVail Memory
    details: 프로젝트별 문서를 네임스페이스로 격리하여 RAG 검색을 제공하는 내부 서비스. Router 뒤에 배치하여 프로젝트 컨텍스트를 외부에 직접 노출하지 않는 구조.
    link: /posts/memory-rag
    linkText: 설계 기록
  - icon: ⚙️
    title: GoVail Runtime
    details: Runner Control Protocol 기반 비동기 실행 파이프라인. NovelPipeline과 Runner SDK CLI로 사람의 승인이 필요한 장기 작업을 단계별 실행 및 감사 로그 기록.
    link: /posts/runtime-pipeline
    linkText: 설계 기록
  - icon: 🔍
    title: GoVail Scanner
    details: 레거시 코드에서 위험 패턴을 정적 분석하고 Gateway용 policy-hints.json을 생성하는 분석기. AI가 위험한 코드를 읽지 못하도록 사전 가이드 힌트를 추출.
    link: /posts/scanner-to-policy
    linkText: 설계 기록
  - icon: 📋
    title: Schema-First Contracts
    details: 마이크로서비스 간 느슨한 결합을 위한 JSON Schema 기반 공통 규격 저장소. Runner Control Protocol, Task Spec, RAG Query 스키마를 중앙 관리.
    link: https://github.com/GoVail/govail-contracts
    linkText: GitHub
---

## 전체 요청 흐름

```text
AI Client (Cursor / Claude Code / curl)
    │
    ▼  OpenAI 호환 API
┌──────────────────┐
│  GoVail Gateway  │  ← DLP 스캔 · API Key 인증 · 모델 Allowlist (Rust/Axum)
└────────┬─────────┘
         │ 검증 완료 요청
         ▼
┌──────────────────┐
│  GoVail Router   │  ← 동기/비동기 분기 · RAG 컨텍스트 주입 (Python/FastAPI)
└──┬───────┬───────┘
   │       │
   │       ▼
   │  ┌────────────┐     ┌───────────────┐
   │  │GoVail Mem  │────▶│ Embedding DB  │  (RAG 검색)
   │  └────────────┘     └───────────────┘
   │
   ├──▶  LiteLLM → LLM API     (동기 응답)
   └──▶  GoVail Runtime        (비동기 승인 파이프라인)
              │
              ▼
         Audit Log DB
```

## 개발 일지

::: info 1. 왜 GoVail을 시작했는가?
**[왜 GoVail을 만들게 되었는가?](/posts/why-govail)**

Claude Code, Cursor 등 AI 코딩 비서를 사용할 때 프로젝트 소스, API Key, 내부 정책 문서가 외부 모델 공급사로 전달될 수 있다는 불안감 — 이를 통제하기 위한 로컬 정책 필터 레이어 구상의 시작.
:::

::: info 2. 실시간 차단 아키텍처
**[GoVail 아키텍처 및 데이터 흐름](/posts/architecture)**

Gateway + Scanner 2-컴포넌트에서 Router · Memory · Runtime을 포함한 5-컴포넌트 아키텍처로 진화한 과정. Mermaid 시퀀스 다이어그램으로 요청 처리 라이프사이클 설명.
:::

::: info 3. 단순함과 복잡함의 경계
**[Gateway vs Runtime: 경계 나누기](/posts/gateway-vs-runtime)**

동기식 API 프록시(Gateway)의 극단적 Stateless 설계와 사람이 수락/거절을 선택하는 장기 실행 승인 루프(Runtime)를 왜 물리적으로 분리했는가.
:::

::: info 4. 코드 분석 → 정책 반영
**[레거시 소스 코드가 어떻게 AI 통제 정책이 되는가?](/posts/scanner-to-policy)**

거창한 SAST 도구가 아닌, AI가 위험한 코드를 다루지 못하도록 사전에 가이드 힌트를 추출하는 Scanner의 현실적 범위와 policy-hints.json 연동 구조.
:::

::: info 5. 감사 로깅 설계
**[기록이 남아야 통제할 수 있다: Audit Event 설계](/posts/audit-event-design)**

Zero-Trust의 출발점인 모든 호출 가시화. JSON Schema 기반 감사 이벤트 규격화와 PII 마스킹 필터 설계.
:::

::: info 6. Router 설계
**[Router: 동기와 비동기 사이에서 균형 잡기](/posts/router-design)**

동기 LLM 릴레이와 Runtime 비동기 트리거의 분기 기준, GCP 환경에서 SSE Keep-alive 하트비트를 주입하는 방법.
:::

::: info 7. Memory — Project RAG
**[Memory: 프로젝트 컨텍스트를 안전하게 격리하는 RAG 서비스](/posts/memory-rag)**

프로젝트 네임스페이스 격리, ingest/search API 구조, 외부 직접 노출을 막은 이유.
:::

::: info 8. Runtime — 비동기 파이프라인
**[Runtime: 사람이 개입하는 비동기 실행 파이프라인](/posts/runtime-pipeline)**

Runner Control Protocol, NovelPipeline 비동기 파이프라인, Runner SDK CLI — 사람이 개입하는 실행 루프의 전체 구조.
:::
