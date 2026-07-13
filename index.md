---
layout: home

hero:
  name: GoVail DevLog
  text: AI Security & Governance Layer
  tagline: "에이전트 스타일 AI 코딩 툴을 쓰며 마주한 보안 문제, 그리고 이를 극복하기 위한 개발 기록"
  image:
    src: https://github.com/GoVail.png
    alt: GoVail Logo
  actions:
    - theme: brand
      text: 첫 글 읽어보기
      link: /posts/why-govail
    - theme: alt
      text: GitHub Organization
      link: https://github.com/GoVail

features:
  - icon: 🛡️
    title: GoVail Gateway
    details: OpenAI 호환 트래픽의 최전선에서 정밀 프롬프트 스캔 및 기밀(Secret) 유출 차단을 담당하는 Rust/Axum 기반 프록시. 10ms 이내 처리를 목표로 극단적 Stateless 설계.
  - icon: 🔀
    title: GoVail Router
    details: Gateway를 통과한 요청을 동기 LLM 릴레이와 비동기 Runtime 트리거로 지능적으로 분기하는 Python/FastAPI 라우터. SSE Keep-alive 하트비트로 장기 연결을 안정적으로 유지.
  - icon: 🧠
    title: GoVail Memory
    details: 프로젝트별 문서 네임스페이스를 격리 관리하고 RAG 검색을 제공하는 Project RAG 컴포넌트. Router 내부에서만 호출되어 외부에 직접 노출되지 않는 구조.
  - icon: ⚙️
    title: GoVail Runtime
    details: Runner Control Protocol 기반의 비동기 실행 파이프라인. NovelPipeline과 Runner SDK CLI를 통해 사람의 승인이 필요한 장기 작업을 단계별로 실행하고 감사 로그를 남깁니다.
  - icon: 🔍
    title: GoVail Scanner
    details: 레거시 PHP 프로젝트 등을 훑어 위험 요소를 식별하고 게이트웨이 보안 가이드를 위한 policy-hints.json을 생성하는 정적 분석기. AI가 위험한 코드를 읽지 못하도록 사전에 차단.
  - icon: 📝
    title: Schema-First Contracts
    details: 각 마이크로서비스가 느슨하게 결합될 수 있도록 설계한 JSON Schema 기반 공통 규격 저장소. Runner Control Protocol, Task Spec, RAG Query 스키마를 중앙 관리.
---

## 📝 개발 일지 & 설계 아티클

GoVail 프로젝트의 설계 의사결정과 구현 기록입니다.

::: info 1. 왜 GoVail을 시작했는가?
* **아티클 링크**: [왜 GoVail을 만들게 되었는가?](/posts/why-govail)
* **내용 요약**: Claude Code, Cursor 등 AI 코딩 비서를 사용할 때 프로젝트 소스, API Key, 내부 정책 문서가 외부 모델 공급사로 전달될 수 있다는 불안감과 이를 통제하기 위해 로컬 정책 필터 레이어를 구상하게 된 동기.
:::

::: info 2. 실시간 차단 아키텍처
* **아티클 링크**: [GoVail 아키텍처 및 데이터 흐름](/posts/architecture)
* **내용 요약**: 초기 2-컴포넌트(Gateway + Scanner)에서 Router / Memory / Runtime을 포함한 5-컴포넌트 아키텍처로 진화한 과정과 각 컴포넌트의 책임 분리 설계.
:::

::: info 3. 단순함과 복잡함의 경계
* **아티클 링크**: [Gateway vs Runtime: 단순함과 복잡함의 경계 나누기](/posts/gateway-vs-runtime)
* **내용 요약**: 동기식 API 프록시 경로(Gateway)의 극단적 Stateless 설계와 사람이 직접 수락/거절을 선택하는 장기 실행 승인 루프(Runtime)를 왜 물리적으로 쪼개어 설계했는가에 대한 설계 의사결정.
:::

::: info 4. 코드 분석 결과의 정책 반영
* **아티클 링크**: [레거시 소스 코드가 어떻게 AI 통제 정책이 되는가?](/posts/scanner-to-policy)
* **내용 요약**: 거창한 취약점 진단 솔루션(SAST)이 아니라, AI가 위험한 소스 코드를 읽고 잘못된 제안을 하거나 유출하지 못하도록 미리 주의를 주는 '가이드 힌트 수집기'로서의 Scanner의 현실적 범위 규정.
:::

::: info 5. 감사 로깅 설계
* **아티클 링크**: [기록이 남아야 통제할 수 있다: 감사 로그(Audit Event) 설계](/posts/audit-event-design)
* **내용 요약**: Zero-Trust의 바탕인 '모든 호출 내역의 가시화'를 실현하기 위해 JSON Schema를 이용해 감사 이벤트 형식을 규격화하고, PII 정보 유출의 온상이 되지 않도록 마스킹 필터를 설계한 이야기.
:::

::: info 6. Router — 스마트 요청 분기와 SSE
* **아티클 링크**: [Router 설계: 동기와 비동기 사이에서 균형 잡기](/posts/router-design)
* **내용 요약**: Gateway를 통과한 요청이 어떤 기준으로 LiteLLM 동기 릴레이와 Runtime 비동기 트리거로 나뉘는지, 그리고 GCP 타임아웃 환경에서 SSE Keep-alive 하트비트를 어떻게 주입했는지 설계 기록.
:::

::: info 7. Memory — Project RAG 아키텍처
* **아티클 링크**: [Memory: 프로젝트 컨텍스트를 안전하게 격리하는 RAG 서비스 설계](/posts/memory-rag)
* **내용 요약**: 여러 프로젝트의 문서를 네임스페이스로 격리하여 RAG 검색을 제공하면서, 외부에 직접 노출되지 않도록 Router 뒤에 위치시킨 설계 이유와 ingest / search API 구조.
:::

::: info 8. Runtime — 비동기 파이프라인과 Runner SDK
* **아티클 링크**: [Runtime: 사람이 개입하는 비동기 실행 파이프라인 구축기](/posts/runtime-pipeline)
* **내용 요약**: Runner Control Protocol로 작업 명세를 수신하고, NovelPipeline 비동기 파이프라인으로 단계별로 실행하며, Runner SDK CLI로 외부에서 제어하는 전체 구조와 설계 의도.
:::
