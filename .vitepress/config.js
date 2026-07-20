import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    title: "GoVail — AI Governance Gateway",
    description: "Enterprise AI를 안전하게. DLP 정책 · 인텔리전트 라우팅 · 실시간 감사 로그를 갖춘 오픈소스 AI 거버넌스 플랫폼.",
    base: "/",

    // 보안: 에이전트 지침 및 README가 빌드에 포함되지 않도록 제외
    srcExclude: ['**/AGENTS.md', '**/GEMINI.md', '**/CLAUDE.md', '**/README.md'],

    // 라이트 모드를 기본값으로 설정
    appearance: 'light',

    head: [
      ['link', { rel: 'icon', href: 'https://avatars.githubusercontent.com/u/291538321?s=32&v=4' }],
      // Inter 폰트 로드
      ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
      ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
      ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap' }],
      // SEO / Open Graph
      ['meta', { property: 'og:type', content: 'website' }],
      ['meta', { property: 'og:title', content: 'GoVail — AI Governance Gateway' }],
      ['meta', { property: 'og:description', content: 'Enterprise AI를 안전하게. DLP 정책 · 인텔리전트 라우팅 · 실시간 감사 로그를 갖춘 오픈소스 AI 거버넌스 플랫폼.' }],
      ['meta', { property: 'og:url', content: 'https://govail.github.io' }],
    ],

    // Mermaid 플러그인 설정 (라이트/다크 모드 자동 대응)
    mermaid: {
      theme: 'default',
    },
    mermaidPlugin: {
      class: 'mermaid',
    },

    themeConfig: {
      logo: 'https://avatars.githubusercontent.com/u/291538321?s=64&v=4',
      siteTitle: 'GoVail',

      socialLinks: [
        { icon: 'github', link: 'https://github.com/GoVail' }
      ],

      nav: [
        { text: '홈', link: '/' },
        { text: '아키텍처', link: '/posts/architecture' },
        {
          text: '개발 일지',
          items: [
            { text: '1. 왜 GoVail을 만들었는가?', link: '/posts/why-govail' },
            { text: '2. 아키텍처 및 데이터 흐름', link: '/posts/architecture' },
            { text: '3. Gateway vs Runtime', link: '/posts/gateway-vs-runtime' },
            { text: '4. 소스 분석 → 정책 연동', link: '/posts/scanner-to-policy' },
            { text: '5. 감사 로그 설계', link: '/posts/audit-event-design' },
            { text: '6. Router 설계', link: '/posts/router-design' },
            { text: '7. Memory RAG', link: '/posts/memory-rag' },
            { text: '8. Runtime 파이프라인', link: '/posts/runtime-pipeline' },
          ]
        },
        {
          text: '프로젝트',
          items: [
            { text: 'GoVail Gateway (Rust)', link: 'https://github.com/GoVail/govail-gateway' },
            { text: 'GoVail Router (Python)', link: 'https://github.com/GoVail/govail-router' },
            { text: 'GoVail Memory (Python)', link: 'https://github.com/GoVail/govail-memory' },
            { text: 'GoVail Runtime (Python)', link: 'https://github.com/GoVail/govail-runtime' },
            { text: 'GoVail Scanner (Python)', link: 'https://github.com/GoVail/govail-scanner' },
            { text: 'GoVail Contracts', link: 'https://github.com/GoVail/govail-contracts' },
          ]
        }
      ],

      sidebar: [
        {
          text: 'Development Essays',
          items: [
            { text: '1. 왜 GoVail을 만들었는가?', link: '/posts/why-govail' }
          ]
        },
        {
          text: 'System Design & Architecture',
          items: [
            { text: '2. 아키텍처 및 데이터 흐름', link: '/posts/architecture' },
            { text: '3. Gateway vs Runtime 분리 철학', link: '/posts/gateway-vs-runtime' },
            { text: '4. 소스 분석을 정책 힌트로 연동하기', link: '/posts/scanner-to-policy' },
            { text: '5. JSON Schema 기반 감사 로그 설계', link: '/posts/audit-event-design' }
          ]
        },
        {
          text: 'Component Deep-Dive',
          items: [
            { text: '6. Router — 스마트 요청 분기와 SSE', link: '/posts/router-design' },
            { text: '7. Memory — Project RAG 아키텍처', link: '/posts/memory-rag' },
            { text: '8. Runtime — 비동기 파이프라인과 Runner SDK', link: '/posts/runtime-pipeline' }
          ]
        }
      ],

      footer: {
        message: 'Released under the Apache 2.0 License.',
        copyright: 'Copyright © 2026-present GoVail Contributors'
      }
    }
  })
)
