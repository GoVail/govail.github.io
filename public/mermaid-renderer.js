// GoVail Mermaid 렌더러
// VitePress의 Shiki 코드 하이라이터가 mermaid 블록을 처리하지 않으므로,
// DOM에서 mermaid 블록을 찾아 동적으로 그래프를 렌더링하는 헬퍼.

function renderMermaid() {
  if (typeof mermaid === 'undefined') return;

  const blocks = document.querySelectorAll('div.language-mermaid pre code');
  if (blocks.length === 0) return;

  try {
    mermaid.initialize({ theme: 'dark', startOnLoad: false });
    const targetDivs = [];

    blocks.forEach(function(block) {
      const container = block.closest('div.language-mermaid');
      if (!container) return;

      // 이미 변환된 경우 중복 처리 방지
      if (container.querySelector('div.mermaid')) return;

      const pre = block.parentElement;
      if (pre) {
        // Vue 돔 유지 및 충돌 방지를 위해 숨김 처리만 수행
        pre.style.display = 'none';
      }

      const mermaidDiv = document.createElement('div');
      mermaidDiv.className = 'mermaid';
      mermaidDiv.style.whiteSpace = 'pre';
      mermaidDiv.style.display = 'block';
      mermaidDiv.style.background = 'rgba(30, 41, 59, 0.4)';
      mermaidDiv.style.border = '1px solid rgba(255,255,255,0.1)';
      mermaidDiv.style.borderRadius = '8px';
      mermaidDiv.style.padding = '1rem';
      mermaidDiv.style.margin = '1rem 0';

      // Shiki의 span.line 구조에서 줄바꿈을 실제 개행 문자(\n)로 조인
      const lines = Array.from(block.querySelectorAll('.line')).map(function(el) {
        return el.textContent;
      });
      mermaidDiv.textContent = lines.length > 0
        ? lines.join('\n')
        : block.textContent.trim();

      container.appendChild(mermaidDiv);
      targetDivs.push(mermaidDiv);
    });

    if (targetDivs.length > 0) {
      mermaid.init(undefined, targetDivs);
    }
  } catch (e) {
    console.error('[Mermaid Render Error]', e);
  }
}

window.addEventListener('DOMContentLoaded', function() {
  renderMermaid();

  // VitePress 페이지 전환 감지를 위한 MutationObserver 설정
  const observer = new MutationObserver(function() {
    renderMermaid();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // CDN 스크립트가 늦게 로드되는 경우를 대비한 폴링 (최대 5초)
  const checkInterval = setInterval(function() {
    if (typeof mermaid !== 'undefined') {
      renderMermaid();
      clearInterval(checkInterval);
    }
  }, 100);
  setTimeout(function() { clearInterval(checkInterval); }, 5000);
});
