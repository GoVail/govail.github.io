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
    details: OpenAI 호환 트래픽의 최전선에서 정밀 프롬프트 스캔 및 기밀(Secret) 유출 차단을 담당하는 Rust 기반 프록시.
  - icon: 🔍
    title: GoVail Scanner
    details: 레거시 PHP 프로젝트 등을 훑어 위험 요소를 식별하고 게이트웨이 보안 가이드를 위한 정책 힌트를 생성하는 분석기.
  - icon: 📝
    title: Schema-First Contracts
    details: 각 마이크로서비스 및 컴포넌트가 느슨하게 결합될 수 있도록 설계한 JSON Schema 기반 공통 규격 저장소.
---

## 📝 최신 개발 일지 및 설계 아티클

정적 HTML로 서빙되는 GoVail의 핵심 빌드 일지 목록입니다.

::: info 1. 왜 GoVail을 시작했는가?
* **아티클 링크**: [왜 GoVail을 만들게 되었는가?](/posts/why-govail)
* **내용 요약**: Claude Code, Cursor 등 AI 코딩 비서들이 무단으로 프로젝트 기밀 소스 및 API Key를 모델 공급사로 전송하는 것의 불안함과 이를 통제하기 위해 로컬 정책 필터 레이어를 구상하게 된 동기.
:::

::: info 2. 실시간 차단 아키텍처
* **아티클 링크**: [GoVail 아키텍처 및 데이터 흐름](/posts/architecture)
* **내용 요약**: 지연 시간(Latency)을 10ms 미만으로 극단적으로 억제하기 위해 Gateway-First 구조를 선택한 배경과, 실시간 트래픽 필터링의 sequence diagram 분석.
:::

::: info 3. 단순함과 복잡함의 경계
* **아티클 링크**: [Gateway vs Runtime: 단순함과 복잡함의 경계 나누기](/posts/gateway-vs-runtime)
* **내용 요약**: 동기식 API 프록시 경로(Gateway)의 극단적 Stateless 설계와 사람이 직접 슬랙 단추 등을 눌러 수락하는 장기 실행 승인 루프(Runtime)를 왜 물리적으로 쪼개어 설계했는가에 대한 설계 의사결정.
:::

::: info 4. 코드 분석 결과의 정책 반영
* **아티클 링크**: [레거시 소스 코드가 어떻게 AI 통제 정책이 되는가?](/posts/scanner-to-policy)
* **내용 요약**: 거창한 취약점 진단 솔루션(SAST)이 아니라, AI가 위험한 소스 코드를 읽고 잘못된 제안을 하거나 유출하지 못하도록 미리 주의를 주는 '가이드 힌트 수집기'로서의 Scanner의 현실적 범위 규정.
:::

::: info 5. 감사 로깅 설계
* **아티클 링크**: [기록이 남아야 통제할 수 있다: 감사 로그(Audit Event) 설계](/posts/audit-event-design)
* **내용 요약**: Zero-Trust의 바탕인 '모든 호출 내역의 가시화'를 실현하기 위해 JSON Schema를 이용해 감사 이벤트 형식을 규격화하고, PII 정보 유출의 온상이 되지 않도록 마스킹 필터를 설계한 이야기.
:::
