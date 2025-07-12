# Video Refine App

리파인 기반 프로젝트입니다.

## 로그인 시스템 설정

### 환경변수 설정

`.env.local` 파일을 생성하고 다음 환경변수를 설정하세요:

```bash
# 백엔드 API 설정
NEXT_PUBLIC_LOGIN_API_ENDPOINT=http://localhost:8080/api/v1/auth/login
NEXT_PUBLIC_REGISTER_API_ENDPOINT=http://localhost:8080/api/v1/auth/register
NEXT_PUBLIC_PASSWORD_API_ENDPOINT=http://localhost:8080/api/v1/auth/password
NEXT_PUBLIC_VERIFICATION_API_ENDPOINT=http://localhost:8080/api/v1/auth/verification

# API 기본 설정
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
API_URL=http://localhost:8080

# 스토리지 설정
NEXT_PUBLIC_STORAGE_URL=http://localhost:8080/storage
STORAGE_URL=http://localhost:8080/storage

# 개발 환경 설정
NODE_ENV=development
```

### 로그인 기능

- **직접 백엔드 API 호출**: 로그인 시 `http://localhost:8080/api/v1/auth/login`으로 직접 요청
- **JWT 토큰 자동 저장**: 로그인 성공 시 받은 JWT 토큰을 자동으로 `auth` 쿠키에 저장
- **다양한 토큰 응답 구조 지원**: 
  - `{ data: "token" }`
  - `{ token: "token" }`
  - `{ access_token: "token" }`
  - 직접 토큰 문자열
- **자동 리다이렉션**: 로그인 성공 후 이전 페이지로 자동 이동
- **에러 처리 개선**: 상세한 에러 메시지 제공

### 테스트 계정 (개발 환경)

개발 환경에서는 다음 테스트 계정을 사용할 수 있습니다:
- **이메일**: test@naver.com
- **비밀번호**: testtest1124

### 사용법

1. 애플리케이션 실행: `npm run dev`
2. 로그인 페이지 접속: `http://localhost:8889/login`
3. 테스트 계정으로 로그인 또는 실제 계정 입력
4. 로그인 성공 시 JWT 토큰이 쿠키에 자동 저장됨

### 쿠키 저장 설정

- **쿠키명**: `auth`
- **유효기간**: 30일
- **경로**: `/`
- **SameSite**: `lax` (CSRF 보호)
- **Secure**: HTTPS 환경에서만 활성화

## 개발 정보

- **프레임워크**: Next.js + Refine
- **인증 라이브러리**: js-cookie, axios
- **UI 라이브러리**: Material-UI
- **포트**: 8889 (개발 서버)
