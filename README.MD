# 문서관리 시스템
## nextjs + refine 기반 시스템 front-repo
## 로그인 시스템 설정
### 환경변수 설정

`.env.local` 파일을 생성하고 다음 환경변수를 설정하세요:

```bash
# 백엔드 API 설정
## document-backend-app 필수
NEXT_PUBLIC_LOGIN_API_ENDPOINT=0/api/v1/auth/login
NEXT_PUBLIC_REGISTER_API_ENDPOINT=/api/v1/auth/register
NEXT_PUBLIC_PASSWORD_API_ENDPOINT=/api/v1/auth/password
NEXT_PUBLIC_VERIFICATION_API_ENDPOINT=/api/v1/auth/verification

# API 기본 설정
NEXT_PUBLIC_API_BASE_URL=백엔드HOST
API_URL=http://localhost:8080

# 환경 설정
NODE_ENV=development // 개발
NODE_ENV=production // 운영
``` 

## Running
1. 애플리케이션 실행: `npm run dev`
2. 로그인 페이지 접속: `http://localhost:8889/login`
3. 테스트 계정으로 로그인 또는 실제 계정 입력
4. 로그인 성공 시 JWT 토큰이 쿠키에 자동 저장됨

### 로그인 쿠키 관련 
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
