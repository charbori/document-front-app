import { cookies } from "next/headers";
import { validateToken } from "../../utils/jwt_util";

export const authProviderServer = {
    check: async () => {
        try {
        const cookieStore = cookies();
            const authCookie = cookieStore.get("auth");

            // 토큰이 없는 경우
            if (!authCookie || !authCookie.value) {
                console.info('[Server] 인증 토큰이 없습니다.');
                return {
                    success: false,
                    authenticated: false,
                    logout: true,
                    redirectTo: "/login",
                };
            }

            // 서버사이드에서 토큰 검증
            const validation = validateToken(authCookie.value);
            
            if (!validation.isValid) {
                console.warn(`[Server] 토큰 검증 실패: ${validation.error}`);
                return {
                    success: false,
                    authenticated: false,
                    logout: true,
                    redirectTo: "/login",
                };
            }

            // 토큰이 유효한 경우
            console.info('[Server] 토큰 검증 성공');
            return {
                success: true,
                authenticated: true,
            };
        } catch (error) {
            console.error('[Server] 인증 체크 중 오류 발생:', error);
        return {
            success: false,
            authenticated: false,
            logout: true,
            redirectTo: "/login",
        };
        }
    },
    getIdentity: async () => {
        try {
        const cookieStore = cookies();
            const authCookie = cookieStore.get("auth");

            if (!authCookie || !authCookie.value) {
                return null;
            }

            // 토큰 검증 후 사용자 정보 반환
            const validation = validateToken(authCookie.value);
            
            if (!validation.isValid || !validation.payload) {
                console.warn(`[Server] getIdentity 토큰 검증 실패: ${validation.error}`);
                return null;
            }

            return validation.payload;
        } catch (error) {
            console.error('[Server] getIdentity 오류:', error);
            return null;
        }
    },
};
