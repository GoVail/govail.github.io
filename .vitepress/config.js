import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "GoVail DevLog",
  description: "AI 에이전트와 LLM을 더 안전하게 쓰기 위한 정책 게이트웨이 개발 일지",
  base: "/",

  // HTML <head> 내에 SEO 및 Open Graph 메타태그 주입
  head: [
    ['link', { rel: 'icon', href: 'https://github.com/GoVail.png' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'GoVail DevLog — AI Security Gateway' }],
    ['meta', { property: 'og:description', content: 'AI 에이전트 기밀 유출 방지를 위한 작은 정책 게이트웨이 구축 기록' }],
    ['meta', { property: 'og:image', content: 'https://github.com/GoVail.png' }],
    ['meta', { property: 'og:url', content: 'https://govail.github.io' }],

    // Mermaid v9 CDN 로드
    ['script', { src: 'https://cdn.jsdelivr.net/npm/mermaid@9.4.3/dist/mermaid.min.js' }],

    // Mermaid 렌더러는 별도 파일로 분리하여 esbuild 빌드 오류 방지
    ['script', { src: '/mermaid-renderer.js', defer: '' }]
  ],

  themeConfig: {
    logo: 'https://github.com/GoVail.png',

    // 깃허브 링크를 상단 우측에 노출
    socialLinks: [
      { icon: 'github', link: 'https://github.com/GoVail' }
    ],

    // 상단 내비게이션 메뉴
    nav: [
      { text: '블로그 홈', link: '/' },
      { text: '왜 만들었는가?', link: '/posts/why-govail' },
      {
        text: '주요 프로젝트',
        items: [
          { text: 'GoVail Gateway (Rust)', link: 'https://github.com/GoVail/govail-gateway' },
          { text: 'GoVail Scanner (Python)', link: 'https://github.com/GoVail/govail-scanner' },
          { text: 'GoVail Router (Python)', link: 'https://github.com/GoVail/govail-router' },
          { text: 'GoVail Memory (Python)', link: 'https://github.com/GoVail/govail-memory' },
          { text: 'GoVail Runtime (Python)', link: 'https://github.com/GoVail/govail-runtime' },
          { text: 'GoVail Contracts', link: 'https://github.com/GoVail/govail-contracts' },
          { text: 'GoVail Examples (데모)', link: 'https://github.com/GoVail/govail-examples' }
        ]
      }
    ],

    // 좌측 사이드바 설정
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
