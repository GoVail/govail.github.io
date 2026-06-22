// marked 옵션 설정 (코드 하이라이팅 연동)
// marked.js 버전별 호환성을 보장하기 위해 렌더링 후 hljs.highlightElement를 호출하는 구조를 취합니다.

let postsData = [];

// 1. 초기화 및 이벤트 리스너 바인딩
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  window.addEventListener('hashchange', handleRoute);
});

// 2. 앱 구동 및 포스트 데이터 가져오기
async function initApp() {
  try {
    const response = await fetch('posts.json');
    if (!response.ok) {
      throw new Error('포스트 정보를 가져오는 데 실패했습니다.');
    }
    postsData = await response.json();
    
    // 라우터 호출
    handleRoute();
  } catch (error) {
    showGlobalError(error.message);
  }
}

// 3. 클라이언트 라우터 (Hash Router)
function handleRoute() {
  const hash = window.location.hash || '#/';
  
  // 뷰 섹션 초기화
  const homeView = document.getElementById('home-view');
  const postView = document.getElementById('post-view');
  
  homeView.classList.remove('active');
  postView.classList.remove('active');
  
  if (hash === '#/' || hash === '#') {
    // 1) 홈 화면 렌더링
    renderPostList();
    homeView.classList.add('active');
  } else if (hash.startsWith('#/post/')) {
    // 2) 개별 글 상세 보기
    const slug = hash.replace('#/post/', '');
    renderPostDetail(slug);
    postView.classList.add('active');
  } else {
    // 3) 잘못된 경로는 홈으로 리디렉트
    window.location.hash = '#/';
  }
  
  // 페이지 전환 시 최상단으로 부드러운 스크롤
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 4. 포스트 목록 그리기
function renderPostList() {
  const postsList = document.getElementById('posts-list');
  postsList.innerHTML = '';
  
  if (postsData.length === 0) {
    postsList.innerHTML = '<div class="loading">등록된 아티클이 없습니다.</div>';
    return;
  }
  
  postsData.forEach(post => {
    const card = document.createElement('a');
    card.href = `#/post/${post.slug}`;
    card.className = 'post-card';
    
    card.innerHTML = `
      <div class="post-card-meta">
        <span class="post-card-category">${post.category}</span>
        <span class="post-card-date">${post.date}</span>
      </div>
      <h3>${post.title}</h3>
      <p class="post-card-desc">${post.description}</p>
    `;
    
    postsList.appendChild(card);
  });
}

// 5. 포스트 상세 본문 읽기 및 파싱
async function renderPostDetail(slug) {
  const post = postsData.find(p => p.slug === slug);
  const contentArea = document.getElementById('post-content');
  
  // 메타 정보 초기화
  document.getElementById('post-title').textContent = post ? post.title : '아티클을 찾을 수 없습니다';
  document.getElementById('post-category').textContent = post ? post.category : 'N/A';
  document.getElementById('post-date').textContent = post ? post.date : '';
  
  contentArea.innerHTML = '<div class="loading">글을 불러오는 중입니다...</div>';
  
  if (!post) {
    contentArea.innerHTML = `
      <div class="error-container">
        <h2>원하는 글을 찾을 수 없습니다.</h2>
        <p>요청하신 글이 존재하지 않거나 경로가 손상되었습니다.</p>
        <a href="#/" class="nav-btn">홈으로 돌아가기</a>
      </div>
    `;
    return;
  }
  
  try {
    const response = await fetch(`posts/${slug}.md`);
    if (!response.ok) {
      throw new Error('마크다운 파일 로드에 실패했습니다.');
    }
    const markdown = await response.text();
    
    // marked.js를 이용해 HTML 파싱
    const parsedHtml = marked.parse(markdown);
    contentArea.innerHTML = parsedHtml;
    
    // highlight.js 코드 구문 강조 트리거
    contentArea.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block);
    });
    
  } catch (error) {
    contentArea.innerHTML = `
      <div class="error-container">
        <h2>글을 불러오는 데 실패했습니다.</h2>
        <p>${error.message}</p>
        <a href="#/" class="nav-btn">홈으로 돌아가기</a>
      </div>
    `;
  }
}

// 6. 전역 에러 안내
function showGlobalError(message) {
  const main = document.querySelector('.app-main');
  main.innerHTML = `
    <div class="error-container">
      <h2>블로그 초기화 실패</h2>
      <p>${message}</p>
    </div>
  `;
}
