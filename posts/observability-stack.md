---
title: "Prometheus + Grafana + Loki로 구축한 실시간 관측 스택"
description: "상용 APM 대신 오픈소스 스택을 선택한 이유, 대시보드 설계, 로그 중앙화 파이프라인"
---

# Prometheus + Grafana + Loki로 구축한 실시간 관측 스택

AI 플랫폼을 운영하다 보면, "AI가 지금 무슨 짓을 하고 있는가?" 그리고 "요청이 어디서 막혀서 지연되고 있는가?"를 실시간으로 파악하는 것이 인프라의 핵심 역량이 됩니다.

GoVail은 Gateway, Router, Scanner 등 여러 서비스로 쪼개져 있기 때문에, 관측성(Observability)은 선택이 아닌 필수였습니다. 이번 글에서는 상용 APM(Datadog, New Relic 등)을 도입하는 대신 **Prometheus + Grafana + Loki (PLG 스택)** 조합의 오픈소스를 활용해 인하우스 관측 스택을 구축한 경험을 나눕니다.

## 왜 상용 APM 대신 오픈소스 스택인가?

초기에는 설정이 편리한 Datadog 도입을 검토했습니다. 그러나 GoVail의 핵심 가치 중 하나인 **데이터 주권(온프레미스 배포 가능성)**과 충돌했습니다. 
보안에 민감한 기업 고객의 네트워크 환경 내부에서 완벽히 폐쇄적으로(air-gapped) 동작할 수 있어야 했기에, 메트릭과 로그 데이터가 외부 클라우드로 빠져나가는 상용 SaaS는 배제할 수밖에 없었습니다.

결과적으로 오픈소스 표준 생태계인 PLG 스택을 로컬 Docker Compose에 내장하기로 결정했습니다.

## 관측 아키텍처 (Mermaid)

```mermaid
graph TD
    subgraph "GoVail Microservices"
        GW[Gateway (Rust)]
        RT[Router (Python)]
        SC[Scanner (Python)]
    end

    subgraph "Observability Stack"
        PROM[Prometheus]
        LOKI[Loki]
        GRAF[Grafana]
        PTAIL[Promtail]
    end

    GW -->|/metrics| PROM
    RT -->|/metrics| PROM
    SC -->|/metrics| PROM

    GW -.->|Logs| PTAIL
    PTAIL -->|Push| LOKI

    PROM -->|Datasource| GRAF
    LOKI -->|Datasource| GRAF
```

## Prometheus: 메트릭 수집 구조

Rust로 작성된 **GoVail Gateway**는 극단적인 성능을 추구합니다. 따라서 무거운 라이브러리를 붙이는 대신, 원시적인 텍스트 포맷으로 직접 Prometheus 메트릭을 노출(`render_prometheus`)하도록 구현했습니다.

실제 코드의 일부입니다:
```rust
// govail-gateway/gateway/src/metrics.rs 일부
impl GatewayMetrics {
    pub fn render_prometheus(&self) -> String {
        let mut out = String::new();
        let _ = writeln!(
            out,
            "# HELP govail_requests_total Total gateway requests\n# TYPE govail_requests_total counter\n{}",
            metric("govail_requests_total", self.inner.requests_total.load(Ordering::Relaxed))
        );
        let _ = writeln!(
            out,
            "# HELP govail_blocked_total Requests blocked by policy\n# TYPE govail_blocked_total counter\n{}",
            metric("govail_blocked_total", self.inner.blocked_total.load(Ordering::Relaxed))
        );
        out
    }
}
```

Prometheus는 정해진 주기(스크랩 간격)마다 각 서비스의 `/metrics` 엔드포인트를 찔러서 누적 카운터를 수집합니다. 이를 통해 Gateway 요청량과 DLP 차단 횟수를 거의 오버헤드 없이 수집할 수 있습니다.

## Grafana: 대시보드 설계

수집된 데이터를 시각화하기 위해 Grafana를 활용했습니다. 제가 설계한 메인 대시보드 패널들은 다음과 같은 주요 질문에 답합니다.

1. **시스템 부하:** 현재 Gateway 초당 요청(RPS)은 얼마인가? (LLM API Rate Limit 대비 모니터링)
2. **보안 지표:** DLP 정책(개인정보 마스킹, 비인가 모델 차단 등)에 의해 블락된 비율(Blocked Rate)은 얼마나 되는가?
3. **병목 지점 (Latency):** 요청이 프록시를 통과하는 데 걸린 시간은 얼마인가? Upstream LLM의 응답 지연인가, Gateway의 부하인가?

Docker Compose에서 Grafana 프로비저닝 설정을 통해, 컨테이너가 뜰 때 이미 정의된 대시보드 JSON 파일들을 자동으로 로드하여 초기 세팅의 번거로움을 줄였습니다.

## Loki + Promtail: 로그 중앙화 파이프라인

메트릭이 "무엇이 문제인가"를 알려준다면, 로그는 "왜 문제인가"를 알려줍니다.
Loki는 인덱싱을 최소화하여 가볍고 빠르게 동작하는 로그 취합 시스템입니다.

각 서비스 컨테이너에서 발생하는 표준 출력(stdout/stderr) 로그는 볼륨으로 공유되거나 Docker 로깅 드라이버를 거쳐 **Promtail** 데몬이 읽어들입니다. Promtail은 이를 Loki로 전송하고, 개발자는 Grafana 인터페이스 한 곳에서 여러 서비스의 로그를 `app="gateway"`와 같이 라벨을 이용해 손쉽게 쿼리하고 교차 검증할 수 있습니다.

## 결론

이 오픈소스 기반의 옵저버빌리티 스택은 `docker-compose.yml` 하나에 우아하게 통합되어 있습니다. 상용 서비스에 의존하지 않으면서도, 실시간 트래픽 모니터링과 장애 분석에 필요한 충분한 가시성을 로컬 환경부터 프로덕션까지 일관성 있게 제공해 주고 있습니다.
