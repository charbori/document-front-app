"use client";
import type { AuthProvider } from "@refinedev/core";
import type { AuthActionResponse } from "@refinedev/core/src/contexts/auth/types";
import axios from "axios";
import Cookies from "js-cookie";
import { removeAuthToken, setAuthToken } from "../../services/api";
import {
    passwordApiEndPoint,
    registerApiEndPoint,
} from "../../utils/common_var";
import { getTokenExpiryTime, validateToken } from "../../utils/jwt_util";

// 토큰 정리 및 로그아웃 처리 헬퍼 함수
const clearAuthTokens = (): void => {
    console.info('인증 토큰을 정리합니다.');
    
    // 쿠키 삭제 전 상태 확인
    const cookieBefore = Cookies.get("auth");
    console.log('쿠키 삭제 전:', cookieBefore ? '존재함' : '없음');
    
    // 모든 쿠키 정보 출력 (디버깅용)
    if (typeof window !== 'undefined') {
        console.log('현재 모든 쿠키:', document.cookie);
    }
    
    // 다양한 방법으로 쿠키 삭제 시도
    // 1. 기본 삭제
    Cookies.remove("auth");
    
    // 2. path 옵션으로 삭제
    Cookies.remove("auth", { path: "/" });
    
    // 3. 현재 도메인으로 삭제
    if (typeof window !== 'undefined') {
        const domain = window.location.hostname;
        Cookies.remove("auth", { path: "/", domain: domain });
        
        // localhost의 경우
        if (domain === 'localhost') {
            Cookies.remove("auth", { path: "/", domain: "" });
        }
    }
    
    // 4. 같은 옵션으로 빈 값 설정 후 만료
    Cookies.set("auth", "", {
        path: "/",
        expires: -1,
        sameSite: 'lax',
        secure: window.location.protocol === 'https:'
    });
    
    // 5. 직접 document.cookie 조작
    if (typeof window !== 'undefined') {
        // 가능한 모든 조합 시도
        document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=" + window.location.hostname;
        document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=." + window.location.hostname;
        document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax";
        
        // localhost를 위한 특별 처리
        if (window.location.hostname === 'localhost') {
            document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=localhost";
            document.cookie = "auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=";
        }
    }
    
    // localStorage 토큰 삭제
    removeAuthToken();
    
    // 쿠키 삭제 후 상태 확인
    setTimeout(() => {
        const cookieAfter = Cookies.get("auth");
        console.log('쿠키 삭제 후:', cookieAfter ? '여전히 존재함' : '삭제됨');
        if (cookieAfter) {
            console.warn('쿠키가 여전히 존재합니다:', cookieAfter);
            console.log('쿠키 삭제 후 모든 쿠키:', document.cookie);
        }
    }, 100);
};

// 자동 로그아웃 처리 헬퍼 함수
const handleAutoLogout = (reason: string) => {
    console.warn(`자동 로그아웃: ${reason}`);
    clearAuthTokens();
    
    // 클라이언트 사이드에서만 실행
    if (typeof window !== 'undefined') {
        // 현재 페이지가 로그인 페이지가 아닌 경우에만 리다이렉트
        if (window.location.pathname !== '/login' && window.location.pathname !== '/compare') {
            const currentPath = window.location.pathname + window.location.search;
            // 원래 페이지 정보를 쿼리 파라미터로 전달
            window.location.href = `/login?to=${encodeURIComponent(currentPath)}`;
        }
    }
    
    return {
        authenticated: false,
        logout: true,
        redirectTo: "/login",
    };
};

export const authProvider: AuthProvider = {
    login: async ({ email, username, password, remember }) => {
        try {
            // 환경변수에서 로그인 API 엔드포인트를 가져오거나 기본값 사용
            const loginEndpoint = process.env.NEXT_PUBLIC_LOGIN_API_ENDPOINT || 
                                 'http://localhost:8080/api/v1/auth/login';
            
            console.log('로그인 요청:', { endpoint: loginEndpoint, username: email || username });
            
            const response = await axios.post(loginEndpoint, {
                username: email || username,
                password: password,
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
                // CORS 설정
                withCredentials: false,
                timeout: 10000, // 10초 타임아웃
            });

            console.log('로그인 응답:', response.data);

            // 토큰 추출 - 다양한 응답 구조 지원
            let authToken = null;
            if (response.data) {
                // case 1: { data: "token" }
                if (response.data.data) {
                    authToken = response.data.data;
                }
                // case 2: { token: "token" }
                else if (response.data.token) {
                    authToken = response.data.token;
                }
                // case 3: { access_token: "token" }
                else if (response.data.access_token) {
                    authToken = response.data.access_token;
                }
                // case 4: "token" (직접 토큰)
                else if (typeof response.data === 'string' && response.data.length > 50) {
                    authToken = response.data;
                }
            }

            if (authToken) {
                // 토큰 유효성 사전 검증
                const validation = validateToken(authToken);
                if (!validation.isValid) {
                    console.error('서버에서 받은 토큰이 유효하지 않습니다:', validation.error);
                    return {
                        success: false,
                        error: {
                            name: "로그인 실패",
                            message: "서버에서 유효하지 않은 토큰을 받았습니다.",
                        },
                    };
                }

                // 쿠키에 토큰 저장 (브라우저에서 인증 상태 확인용)
                const cookieOptions = {
                    expires: 30, // 30일
                    path: "/",
                    sameSite: 'lax' as const, // CSRF 보호
                    secure: typeof window !== 'undefined' && window.location.protocol === 'https:' // HTTPS에서만 secure 플래그
                };
                
                Cookies.set("auth", authToken, cookieOptions);
                
                // localStorage에도 토큰 저장 (API 호출시 사용)
                setAuthToken(authToken);
                
                console.log('로그인 성공, 토큰 저장 완료');
                console.log('토큰 payload:', validation.payload);
                
                // 로그인 전 페이지로 돌아가거나 홈페이지로 리디렉션
                const urlParams = new URLSearchParams(window.location.search);
                const redirectTo = urlParams.get('to') || '/documents';
                
                // 성공 응답 반환
                const authActionResponse: AuthActionResponse = {
                    success: true,
                    redirectTo: redirectTo,
                };
                
                // 페이지 리디렉션 (선택적)
                setTimeout(() => {
                    if (typeof window !== 'undefined') {
                        window.location.href = redirectTo;
                    }
                }, 100);
                
                return authActionResponse;
            } else {
                console.error('로그인 응답에 토큰이 없습니다:', response.data);
                return {
                    success: false,
                    error: {
                        name: "로그인 실패",
                        message: "서버 응답에서 인증 토큰을 찾을 수 없습니다.",
                    },
                };
            }
        } catch (error: any) {
            console.error("로그인 오류:", error);
            
            // 에러 메시지 개선
            let errorMessage = "계정명과 비밀번호를 확인해주세요.";
            
            if (error.response) {
                // 서버에서 응답한 에러
                const status = error.response.status;
                const data = error.response.data;
                
                console.error('서버 에러 응답:', { status, data });
                
                if (status === 401) {
                    errorMessage = "아이디 또는 비밀번호가 올바르지 않습니다.";
                } else if (status === 403) {
                    errorMessage = "계정이 비활성화되었거나 접근이 차단되었습니다.";
                } else if (status === 429) {
                    errorMessage = "너무 많은 로그인 시도입니다. 잠시 후 다시 시도해주세요.";
                } else if (status >= 500) {
                    errorMessage = "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
                } else if (data?.message) {
                    errorMessage = data.message;
                }
            } else if (error.request) {
                // 네트워크 오류
                console.error('네트워크 오류:', error.request);
                errorMessage = "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = "요청 시간이 초과되었습니다. 다시 시도해주세요.";
            }
            
            return {
                success: false,
                error: {
                    name: "로그인 실패",
                    message: errorMessage,
                },
            };
        }
    },
    logout: async () => {
        console.log('로그아웃 시작');
        
        // 로그아웃 API 호출을 먼저 시도 (토큰이 아직 유효한 상태에서)
        try {
            const response = await axios.get(`/api/auth?type=logout`, {
                headers: {
                    "Content-Type": "application/json",
                },
                withCredentials: true // 쿠키 포함
            });
            console.log('로그아웃 API 응답:', response.data);
            console.log('응답 헤더:', response.headers);
        } catch (error) {
            // API 호출 실패해도 로그아웃 진행
            console.error("Logout API error:", error);
        }
        
        // 토큰 정리 (API 호출 성공/실패와 관계없이 항상 실행)
        clearAuthTokens();
        
        // 브라우저 캐시를 무시하고 강제 새로고침
        if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            const redirectTo = currentPath === '/compare' ? '/compare' : '/login';
            
            // 1. 먼저 로그인 페이지로 이동
            if (currentPath !== redirectTo) {
                window.location.href = redirectTo;
            } else {
                // 2. 이미 해당 페이지에 있다면 강제 새로고침
                window.location.reload();
            }
            
            // 3. 추가로 브라우저 히스토리 정리
            setTimeout(() => {
                if (window.location.pathname !== redirectTo) {
                    window.location.replace(redirectTo);
                }
            }, 100);
        }
        
        return {
            success: true,
            redirectTo: "/login",
        };
    },
    check: async () => {
        const auth = Cookies.get("auth");

        // 토큰이 없는 경우
        if (!auth) {
            console.info('인증 토큰이 없습니다.');
            return {
                authenticated: false,
                logout: true,
                redirectTo: "/login",
            };
        }

        // 강화된 토큰 검증
        const validation = validateToken(auth);
        
        if (!validation.isValid) {
            // 토큰 검증 실패 시 자동 로그아웃
            return handleAutoLogout(`토큰 검증 실패: ${validation.error}`);
        }

        // 토큰 만료 시간 확인 (30분 이하 남은 경우 경고)
        const expiryTime = getTokenExpiryTime(auth);
        if (expiryTime !== null) {
            if (expiryTime <= 0) {
                return handleAutoLogout('토큰이 만료되었습니다');
            } else if (expiryTime < 1800) { // 30분
                console.warn(`토큰 만료까지 ${Math.floor(expiryTime / 60)}분 남았습니다.`);
            }
        }

        // localStorage에도 토큰이 있는지 확인하고 없으면 설정
        const localToken = localStorage.getItem('auth_token');
        if (!localToken) {
            console.info('localStorage에 토큰을 동기화합니다.');
            setAuthToken(auth);
        }

        return {
            authenticated: true,
        };
    },
    getPermissions: async () => {
        const auth = Cookies.get("auth");

        if (auth) {
            const validation = validateToken(auth);
            if (validation.isValid && validation.payload) {
                return validation.payload.role;
            }
        }
        return null;
    },
    getIdentity: async () => {
        const auth = Cookies.get("auth");
        if (auth) {
            const validation = validateToken(auth);
            if (validation.isValid && validation.payload) {
                return validation.payload;
            }
        }
        return null;
    },
    onError: async (error) => {
        if (error.response?.status === 401 || error.status === 401) {
            // 401 에러시 자동 로그아웃
            return {
                ...handleAutoLogout('401 인증 오류 발생'),
                logout: true,
            };
        }

        return { error };
    },
    register: async ({ email, username, password, remember }) => {
        try {
            const response = await axios
                .post(registerApiEndPoint ?? "", {
                    username: email,
                    password: password,
                })
                .then(function (response) {
                    return {
                        success: true,
                        redirectTo: "/login",
                    };
                })
                .catch(function (error) {
                    return {
                        success: false,
                        error: {
                            name: "RegisterError",
                            message: "회원가입에 실패했습니다",
                        },
                    };
                });
            return await response;
        } catch (error) {
            return {
                success: false,
                error: {
                    name: "RegisterError",
                    message: "회원가입에 실패했습니다",
                },
            };
        }
    },
    forgotPassword: async ({ email, redirectPath }) => {
        const response = await axios
            .get(passwordApiEndPoint + "?username=" + email)
            .then(function (response) {
                return {
                    success: true,
                    redirectTo: "/login",
                    successNotification: {
                        message: "비밀번호 찾기성공",
                        description:
                            "계정의 메일에서 비밀번호 초기화를 진행해주세요.",
                    },
                };
            })
            .catch(function (error) {
                return {
                    success: false,
                    error: {
                        name: "비밀번호 찾기실패",
                        message: "계정이 올바르지 않습니다.",
                    },
                };
            });
        return await response;
    },
    updatePassword: async ({ password, confirmPassword }) => {
        const queryParameters = new URLSearchParams(window.location.search);
        const verificationCode = queryParameters.get("verificationCode");
        const response = await axios
            .post(passwordApiEndPoint ?? "", {
                password: password,
                verificationCode: verificationCode,
            })
            .then(function (response) {
                return {
                    success: true,
                    redirectTo: "/login",
                    successNotification: {
                        message: "비밀번호 변경성공",
                        description: "비밀번호 변경에 성공하였습니다.",
                    },
                };
            })
            .catch(function (error) {
                return {
                    success: false,
                    error: {
                        name: "비밀번호 찾기실패",
                        message: "계정이 올바르지 않습니다.",
                    },
                };
            });
        return await response;
    },
};
