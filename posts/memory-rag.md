---
title: "Memory: 프로젝트 컨텍스트를 안전하게 격리하는 RAG 서비스 설계"
description: GoVail Memory가 여러 프로젝트의 문서를 어떻게 네임스페이스로 격리하여 RAG 검색을 제공하는지, 그리고 왜 외부에 직접 노출하지 않고 Router 뒤에 배치했는지 설계 기록입니다.
---

# Memory: 프로젝트 컨텍스트를 안전하게 격리하는 RAG 서비스 설계

AI 코딩 어시스턴트를 쓰다 보면 금방 느끼는 한계가 있습니다.

> "이 AI는 내 프로젝트의 맥락을 전혀 모른다. 매번 관련 코드나 문서를 복사해서 붙여넣어야 한다."

물론 RAG(Retrieval-Augmented Generation)라는 기술이 이 문제를 해결해 줄 수 있습니다. 하지만 GoVail 환경에서 RAG를 도입하려면 한 가지 핵심 고민이 추가됩니다.

> "프로젝트 A의 문서가 프로젝트 B의 LLM 요청에 섞여 나가면 어떡하지?"

이 격리 문제를 해결하기 위해 **GoVail Memory**를 별도 서비스로 설계했습니다.

---

## 1. 핵심 원칙: 프로젝트 스코프 격리

GoVail은 여러 프로젝트의 문서를 동시에 다룹니다. 각 프로젝트는 독립적인 **네임스페이스**로 관리됩니다. A 프로젝트의 RAG 검색은 A 네임스페이스 내에서만 이루어지며, B 프로젝트의 문서가 결과에 포함될 수 없습니다.

```text
[Memory 내부 구조]

프로젝트 네임스페이스
├── project-alpha/
│   ├── chunk 1: "인증 모듈은 JWT를 사용한다..."
│   ├── chunk 2: "배포 환경은 GCP Cloud Run..."
│   └── embedding 벡터들
│
├── project-beta/
│   ├── chunk 1: "PHP 레거시 코드 구조..."
│   └── embedding 벡터들
│
└── (NAS 마운트 프로젝트는 ingest 제외)
```

NAS에 마운트된 프로젝트는 ingest 대상에서 제외됩니다. 실시간 추론 경로에서 NAS 직접 I/O가 발생하면 네트워크 지연으로 인한 병목이 생기기 때문입니다.

---

## 2. API 구조: ingest와 search

Memory의 공개 API는 크게 두 가지입니다.

### 문서 ingest

```text
POST /projects/{project_id}/ingest
```

문서를 받아 chunk로 분할하고 embedding을 생성하여 저장합니다. 지원 형식: 마크다운, 텍스트, 소스코드 파일.

### RAG 검색

```text
POST /projects/{project_id}/search
```

쿼리 문자열을 받아 해당 프로젝트 네임스페이스 내에서 유사도 검색을 수행하고, 관련 chunk와 source 정보를 반환합니다.

```json
{
  "query": "JWT 인증 처리 방식",
  "limit": 5,
  "results": [
    {
      "content": "인증 모듈은 HS256 알고리즘의 JWT를 사용하며...",
      "source": "docs/auth-design.md",
      "score": 0.92
    }
  ]
}
```

검색 결과에는 반드시 `source`(원문 위치)가 포함됩니다. Router가 이를 LLM 요청의 시스템 프롬프트에 주입할 때, LLM이 근거 출처를 함께 응답할 수 있도록 하기 위해서입니다.

---

## 3. 왜 외부에 직접 노출하지 않는가?

Memory는 `govail-gateway`가 아닌 **내부 네트워크에서 Router만 접근 가능**하도록 배포됩니다. 외부 클라이언트가 직접 Memory에 쿼리를 날릴 수 없습니다.

이 결정에는 두 가지 이유가 있습니다.

**첫째, 인증과 프로젝트 스코프 검증은 Gateway의 책임입니다.** Memory는 "이 요청자가 이 프로젝트에 접근할 권한이 있는가?"를 스스로 판단하지 않습니다. Gateway → Router를 거쳐야만 합니다. Memory는 이미 검증된 요청만 받는다고 가정합니다.

**둘째, 프로젝트 문서는 민감한 내부 자산입니다.** 레거시 소스코드, 설계 문서, 내부 API 스펙이 Memory에 저장될 수 있습니다. 이를 직접 노출하는 것은 GoVail이 막으려는 정보 유출과 다를 바가 없습니다.

```text
[올바른 접근 경로]
Client → Gateway → Router → Memory ✅

[차단된 접근 경로]
Client → Memory (직접) ❌
```

---

## 4. limit 검색 최대값

초기 설계에서 검색 결과 `limit` 파라미터의 최댓값이 너무 작게 설정되어 있었습니다. 운영 중 대형 문서 집합에서 충분한 컨텍스트를 가져오지 못하는 문제가 발생했고, 이를 해결하기 위해 `SearchRequest limit`의 최댓값을 상향 조정했습니다.

이 경험은 RAG 시스템 설계에서 종종 간과되는 점을 상기시켜 줍니다. **얼마나 많은 chunk를 가져올 것인가**는 LLM 컨텍스트 윈도우 크기, 쿼리의 복잡도, 그리고 응답 품질 사이의 균형 문제입니다.

---

## 5. 현재 상태와 남은 과제

GoVail Memory는 현재 프로젝트별 ingest, chunk 저장, RAG 검색의 기본 플로우가 동작합니다. URL 쿼리 동기화와 검색 필터 상태 유지도 구현되어 있습니다.

남아 있는 과제는 **embedding 모델 선택**입니다. 현재는 외부 embedding API에 의존하고 있는데, 이를 로컬 MLX 모델로 대체하면 프로젝트 문서가 외부로 전혀 나가지 않는 완전 폐쇄형 RAG가 가능해집니다. GoVail의 핵심 철학인 '기밀 유출 방지'와 가장 잘 맞는 방향입니다.
