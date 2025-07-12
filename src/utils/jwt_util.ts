type JwtPayload = {
    exp?: number;
    iat?: number;
    [key: string]: any;
};

interface TokenValidationResult {
    isValid: boolean;
    payload: JwtPayload | null;
    error?: string;
}

function parseJwt(token: string): JwtPayload | null {
    try {
        // JWT 토큰 구조 검증 (header.payload.signature)
        if (!token || typeof token !== 'string') {
            return null;
        }

        const parts = token.split('.');
        if (parts.length !== 3) {
            return null;
        }

        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map(function (c) {
                    return (
                        "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
                    );
                })
                .join("")
        );

        return JSON.parse(jsonPayload);
    } catch (e) {
        console.warn('JWT 파싱 오류:', e);
        return null;
    }
}

// 토큰 유효성 종합 검증
export function validateToken(token: string): TokenValidationResult {
    try {
        // 기본 구조 검증
        if (!token || typeof token !== 'string' || token.trim() === '') {
            return {
                isValid: false,
                payload: null,
                error: '토큰이 비어있거나 유효하지 않습니다'
            };
        }

        // JWT 구조 검증
        const parts = token.split('.');
        if (parts.length !== 3) {
            return {
                isValid: false,
                payload: null,
                error: '잘못된 JWT 토큰 구조입니다'
            };
        }

        // 페이로드 파싱
        const payload = parseJwt(token);
        if (!payload) {
            return {
                isValid: false,
                payload: null,
                error: '토큰 페이로드 파싱에 실패했습니다'
            };
        }

        // 만료 시간 검증
        if (payload.exp) {
            const currentTime = Math.floor(Date.now() / 1000);
            if (payload.exp <= currentTime) {
                return {
                    isValid: false,
                    payload,
                    error: '토큰이 만료되었습니다'
                };
            }
        }

        // 발급 시간 검증 (미래 시간이면 무효)
        if (payload.iat) {
            const currentTime = Math.floor(Date.now() / 1000);
            if (payload.iat > currentTime + 60) { // 1분 오차 허용
                return {
                    isValid: false,
                    payload,
                    error: '토큰 발급 시간이 유효하지 않습니다'
                };
            }
        }

        return {
            isValid: true,
            payload,
        };
    } catch (error) {
        return {
            isValid: false,
            payload: null,
            error: `토큰 검증 중 오류 발생: ${error}`
        };
    }
}

// 토큰 만료까지 남은 시간 (초)
export function getTokenExpiryTime(token: string): number | null {
    const payload = parseJwt(token);
    if (!payload || !payload.exp) {
        return null;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp - currentTime;
}

export default parseJwt;
