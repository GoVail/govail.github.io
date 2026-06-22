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
    
    // Mermaid 다이어그램 동적 렌더링을 위해 v9 글로벌 라이브러리를 head에 로드
    ['script', { src: 'https://cdn.jsdelivr.net/npm/mermaid@9.4.3/dist/mermaid.min.js' }],
    
    // 라우트 전환이 잦은 SPA성 환경이므로 DOM 변경을 감시하여 mermaid 다이어그램을 동적으로 그리는 헬퍼 스크립트 주입
    ['script', {}, `
      function renderMermaid() {
        if (typeof mermaid !== 'undefined') {
          const blocks = document.querySelectorAll('pre code.language-mermaid');
          if (blocks.length > 0) {
            mermaid.initialize({ theme: 'dark', startOnLoad: false });
            const targetDivs = [];
            blocks.forEach((block) => {
              const pre = block.parentElement;
              const mermaidDiv = document.createElement('div');
              mermaidDiv.className = 'mermaid';
              mermaidDiv.style.whiteSpace = 'pre';
              mermaidDiv.style.display = 'block';
              mermaidDiv.style.justifyContent = 'center';
              mermaidDiv.style.background = 'rgba(30, 41, 59, 0.4)';
              mermaidDiv.style.border = '1px solid rgba(255,255,255,0.1)';
              mermaidDiv.style.borderRadius = '8px';
              mermaidDiv.style.padding = '1rem';
              mermaidDiv.style.margin = '1rem 0';
              mermaidDiv.textContent = block.textContent.trim();
              pre.replaceWith(mermaidDiv);
              targetDivs.push(mermaidDiv);
            });
            mermaid.init(undefined, targetDivs);
          }
        }
      }
      
      // 최초 로드 시 실행
      window.addEventListener('DOMContentLoaded', () => {
        renderMermaid();
        
        // VitePress 페이지 전환 감지를 위한 MutationObserver 설정
        const observer = new MutationObserver((mutations) => {
          renderMermaid();
        });
        observer.observe(document.body, { childList: true, subtree: true });
      });
    `]
  ],

  themeConfig: {
    logo: 'https://github.com/GoVail.png',
    
    // 깃허브 오그 링크를 상단 우측에 노출
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
          { text: 'GoVail Contracts', link: 'https://github.com/GoVail/govail-contracts' },
          { text: 'GoVail Examples (데모)', link: 'https://github.com/GoVail/govail-examples' }
        ]
      }
    ],

    // 좌측 사이드바 설정 (아티클 카테고리 구성)
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
      }
    ],

    footer: {
      message: 'Released under the Apache 2.0 License.',
      copyright: 'Copyright © 2026-present GoVail Contributors'
    }
  }
})
