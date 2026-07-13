---
title: "Runtime: 사람이 개입하는 비동기 실행 파이프라인 구축기"
description: Runner Control Protocol로 작업 명세를 수신하고, NovelPipeline 비동기 파이프라인으로 단계별 실행하며, Runner SDK CLI로 외부에서 제어하는 GoVail Runtime의 전체 구조와 설계 의도를 기록합니다.
---

# Runtime: 사람이 개입하는 비동기 실행 파이프라인 구축기

[Gateway vs Runtime 포스트](/posts/gateway-vs-runtime)에서 GoVail Gateway를 단순하게 유지하기 위해 복잡한 승인 워크플로우를 외부로 격리해야 한다는 설계 의사결정을 기록한 바 있습니다.

하지만 그 외부 격리 공간이 실제로 어떻게 생겼는지는 미뤄두었습니다. 그것이 바로 **GoVail Runtime**입니다.

---

## 1. Runtime이 해결하려는 문제

AI 에이전트가 점점 강력해지면서, 단순한 LLM 응답 생성을 넘어서는 **실제 행동(Action)**을 수행하려는 경향이 강해지고 있습니다.

- 파일 시스템 수정
- 터미널 명령 실행
- 외부 API 호출
- 데이터베이스 변경

이러한 작업들은 LLM이 틀렸을 때의 파급력이 큽니다. 따라서 **사람이 최종 확인 단추를 눌러야 실행**되어야 하는 경우가 있습니다. GoVail Runtime은 이 "인간 개입 루프(Human-in-the-Loop)"를 구조화된 방식으로 구현합니다.

---

## 2. Runner Control Protocol

Router와 Runtime 사이의 통신은 **Runner Control Protocol**로 명세됩니다. 이는 `govail-contracts`에 JSON Schema로 중앙 관리됩니다.

작업을 요청할 때는 **Task Spec**을 사용합니다.

```json
{
  "task_id": "task-abc123",
  "project_id": "project-alpha",
  "pipeline": "novel",
  "steps": [
    {
      "type": "llm_call",
      "prompt": "다음 코드를 리팩토링해 주세요...",
      "require_approval": false
    },
    {
      "type": "file_write",
      "path": "src/auth.py",
      "require_approval": true
    }
  ],
  "metadata": {
    "triggered_by": "cursor-agent",
    "created_at": "2026-07-14T01:00:00Z"
  }
}
```

`require_approval: true`로 표시된 스텝은 Runtime이 자동으로 실행하지 않고 사람의 승인을 기다립니다.

---

## 3. NovelPipeline: 비동기 파이프라인 구조

GoVail Runtime의 핵심 실행 엔진은 **NovelPipeline**입니다. Task Spec을 받아 스텝을 순서대로 실행하되, 각 스텝의 결과를 다음 스텝의 입력으로 연결하는 파이프라인 구조입니다.

```text
[NovelPipeline 실행 흐름]

Task Spec 수신
      │
      ▼
Step 1: LLM 호출 (자동 실행)
      │
      ├─ 결과: 리팩토링된 코드 제안
      │
      ▼
Step 2: 파일 쓰기 (승인 대기) ←── require_approval: true
      │
      ├─ Approval 요청 생성 (Slack 알림 / UI)
      │
   [사람의 승인]
      │
      ├─ 승인 → 파일 쓰기 실행 → 완료 감사 로그
      └─ 거절 → 작업 중단 → 거절 감사 로그
```

파이프라인은 완전 비동기로 동작합니다. 사람이 승인 창에서 단추를 누를 때까지 Runtime은 해당 Task를 대기 상태로 유지합니다. 이 대기는 수초가 될 수도 있고, 수 시간이 될 수도 있습니다.

---

## 4. Runner SDK CLI

Runtime에 작업을 제출하거나 상태를 조회하고 승인/거절을 처리하기 위한 **Runner SDK**가 별도 패키지로 분리되어 있습니다.

```bash
# 작업 제출
runner submit --spec task.json

# 작업 상태 조회
runner status task-abc123

# 승인 처리
runner approve task-abc123 --step 2

# 거절 처리
runner reject task-abc123 --step 2 --reason "보안 검토 필요"
```

SDK는 CLI 형태로 터미널에서 직접 사용할 수 있으며, 향후 Slack 봇이나 웹 UI와 연동될 수 있는 구조로 설계되어 있습니다.

---

## 5. 감사 로그와의 연계

Runtime의 모든 실행 이벤트는 감사 로그로 기록됩니다. 작업이 시작되었을 때, 각 스텝이 완료되었을 때, 사람이 승인하거나 거절했을 때, 최종 완료되었을 때 모두 기록됩니다.

이는 GoVail의 Zero-Trust 철학에서 비롯된 것입니다. 어떤 AI가 어떤 작업을 요청했고, 사람이 그것을 승인했는지 거절했는지, 실제로 무엇이 실행되었는지 — 이 모든 흐름이 사후에 추적 가능해야 합니다.

```json
{
  "event_type": "task_step_approved",
  "task_id": "task-abc123",
  "step_index": 2,
  "approved_by": "user@example.com",
  "approved_at": "2026-07-14T01:05:23Z",
  "context": {
    "step_type": "file_write",
    "target_path": "src/auth.py"
  }
}
```

---

## 6. 현재 상태와 앞으로의 방향

GoVail Runtime은 현재 Phase 2까지 구현되어 있습니다.

- **Phase 1 (완료)**: Runner SDK 패키지 분리, 기본 구조 수립
- **Phase 2 (완료)**: Runner Control Channel, Runner SDK CLI, 기본 Task 실행 플로우
- **Phase 3 (계획 중)**: Temporal 워크플로우 오케스트레이터 연동, 복잡한 상태 머신 구동, Slack/웹 Approval UI

현재는 Python 비동기 방식으로 단순하게 구현되어 있지만, 장기적으로는 Temporal을 도입하여 훨씬 복잡한 워크플로우(타임아웃, 재시도, 분기, 병렬 실행 등)를 안정적으로 처리하는 것이 목표입니다.

AI가 스스로 실행하는 세계에서, 사람이 어느 지점에서 통제권을 행사할 것인지를 명확하게 설계하는 것. GoVail Runtime이 풀어나가려는 근본 질문입니다.
