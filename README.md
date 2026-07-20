# GoVail — 공식 사이트 (govail.github.io)

> **Enterprise AI 거버넌스 플랫폼** GoVail의 공식 웹사이트.  
> 아키텍처 설계, 기술 에세이, Quick Start 가이드를 제공합니다.

🔗 **Live**: [https://govail.github.io](https://govail.github.io)

---

## 🛠️ 기술 스택

- **[VitePress](https://vitepress.dev/)** — Vue 기반 정적 사이트 생성기
- **[Mermaid](https://mermaid.js.org/)** — 아키텍처 다이어그램 렌더링
- **Inter** — Google Fonts (400/500/600)
- **Steel Blue** — 커스텀 테마 (라이트/다크 모드 지원)
- **GitHub Pages** — 자동 배포 (main 브랜치 push 시)

---

## 📁 구조

```
govail.github.io/
├── index.md              ← 메인 랜딩 페이지
├── posts/                ← 8편의 기술 에세이
│   ├── why-govail.md     ← 1. 왜 GoVail을 만들었는가?
│   ├── architecture.md   ← 2. 아키텍처 및 데이터 흐름
│   ├── gateway-vs-runtime.md
│   ├── scanner-to-policy.md
│   ├── audit-event-design.md
│   ├── router-design.md
│   ├── memory-rag.md
│   └── runtime-pipeline.md
├── .vitepress/
│   ├── config.js         ← VitePress 설정 (SEO, nav, sidebar)
│   └── theme/
│       ├── index.js
│       └── custom.css    ← Steel Blue 커스텀 테마
├── .github/workflows/
│   └── deploy.yml        ← GitHub Pages 자동 배포 CI
└── package.json
```

---

## 🏃 로컬 개발

```bash
# 의존성 설치
npm install

# 개발 서버 (라이브 리로드)
npm run docs:dev

# 빌드 검증
npm run docs:build

# 빌드 결과 미리보기
npm run docs:preview
```

---

## ✍️ 새 글 작성

1. `posts/` 디렉토리에 `.md` 파일 생성
2. `.vitepress/config.js`의 `nav` → `개발 일지` 항목과 `sidebar` 항목에 링크 추가
3. `index.md`에 `::: info` 블록 추가 (선택)
4. 커밋 → main 푸시 → GitHub Actions 자동 배포

---

## License

Apache License 2.0
