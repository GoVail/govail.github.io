# GoVail 블로그 (govail.github.io)

GoVail의 제품 철학, 아키텍처 의사결정, 그리고 개발 과정에서의 삽질기를 다루는 **공식 정적 블로그 저장소**입니다. 

GitHub Pages를 통해 `https://govail.github.io`로 직접 호스팅됩니다.

---

## 🛠️ 기술적 특징 (무빌드 정적 SPA)

- **Build-less**: Webpack, Vite, Astro 등의 빌드 파이프라인을 거치지 않습니다. 소스 코드를 수정하고 깃허브에 푸시하는 즉시 실시간으로 반영됩니다.
- **Client-side Markdown Parsing**: 마크다운(.md) 파일들을 브라우저상에서 비동기로 가져와(fetch), `marked.js`로 동적 파싱하여 렌더링합니다.
- **Syntax Highlighting**: 기술 블로그인 만큼 코드 예시가 깔끔히 노출되도록 `highlight.js`와 Github Dark 스타일 테마를 적용했습니다.
- **Hash-routing**: `#posts/why-govail`과 같은 해시 링크 구조를 사용하여, GitHub Pages의 고질적인 단점인 SPA 서브디렉토리 라우팅 404 오류를 해결했습니다.

---

## 🏃 로컬 개발 및 테스트

로컬 환경에서 작성한 글을 브라우저로 미리 보고 싶다면, Python 내장 HTTP 서버를 활용하는 것이 가장 간편합니다.

```bash
# 이 저장소의 루트 디렉토리에서 간단히 구동합니다.
python3 -m http.server 8000
```
이후 브라우저에서 `http://localhost:8000`으로 접속하여 포스트 로드 및 테마 디자인을 확인할 수 있습니다.

---

## ✍️ 새 글 작성하는 법

1. `posts/` 디렉토리에 마크다운(`.md`) 형식으로 새 글을 작성합니다.
2. 루트 디렉토리의 `posts.json` 파일을 열어 새로 추가한 글의 메타데이터(slug, 제목, 카테고리, 날짜, 간략 설명)를 등록합니다.
   ```json
   {
     "slug": "my-new-post",
     "title": "새로 쓰는 개발 이야기",
     "description": "블로그 시스템에 새 글이 추가되는 원리 설명",
     "date": "2026-06-22",
     "category": "Tech"
   }
   ```
3. 변경 사항을 커밋하고 main 브랜치에 푸시하면, 1~2분 뒤 자동으로 블로그 웹사이트에 업데이트됩니다.

---

## License

Apache License 2.0
