# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소의 코드를 다룰 때 참고하는 가이드입니다.

## 프로젝트 개요

AppleForum — Express.js, EJS 템플릿, MongoDB Atlas로 구축된 서버사이드 렌더링 게시판 애플리케이션. 한국어 UI. 모든 서버 로직은 단일 `server.js` 파일에 존재.

## 명령어

- **의존성 설치:** `npm install`
- **서버 실행:** `node server.js` (포트 8080에서 시작, MongoDB Atlas 연결 필요)
- **코드 포맷팅:** `npx prettier --write .`
- **테스트 스위트는 구성되어 있지 않음.**

## 아키텍처

**단일 파일 서버 (`server.js`):** 모든 라우트, DB 연결, 미들웨어 설정이 하나의 파일에 존재. 라우터 모듈이나 컨트롤러 분리 없음.

**렌더링:** EJS를 통한 서버사이드 렌더링. `views/` 내 템플릿들이 공통 `nav.ejs` 파셜을 포함. 정적 파일은 `public/`에서 제공.

**데이터베이스:** MongoDB Atlas, `mongodb` 드라이버로 접근 (Mongoose 아님). `forum` 데이터베이스 내 `post` 단일 컬렉션 사용. 문서에는 `title`과 `content` 필드 존재.

**HTTP 메서드 지원:** `method-override` 패키지로 HTML 폼에서 `?_method=` 쿼리 파라미터를 통해 PUT/DELETE 사용 가능.

**라우트:**
- `GET /` — 정적 `index.html`
- `GET /list`, `GET /list/:id` — 페이지네이션된 글 목록 (skip/limit, 페이지당 5개)
- `GET /list/next/:id` — ObjectId 기반 커서 페이지네이션
- `POST /add` — 글 작성
- `GET /edit/:id`, `PUT /edit` — 글 수정 (부분 구현)
- `GET /detail/:id` — 단일 글 조회
- `DELETE /delete` — 쿼리 파라미터 `docid`로 글 삭제

## 코드 스타일

Prettier 설정 (`.prettierrc`): 작은따옴표, 후행 쉼표, 2칸 들여쓰기, 100자 줄 너비, LF 줄 끝. VS Code 저장 시 자동 포맷팅.
