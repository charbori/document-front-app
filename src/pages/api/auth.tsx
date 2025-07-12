import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { loginApiEndPoint } from "../../utils/common_var";

type ResponseData = {
    message: string;
    data?: string;
};

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<ResponseData>
) {
    if (req.method === "POST") {
        var authToken = "";
        try {
            const response = await axios.post(loginApiEndPoint ?? "", {
                username: req.body.username,
                password: req.body.password,
            });
            
            authToken = response.data.data;
            
            if (authToken) {
                // Next.js API Routes에서 올바른 쿠키 설정 방법
                const isProduction = process.env.NODE_ENV === 'production';
                const cookieOptions = [
                    `auth=${authToken}`,
                    'Path=/',
                    // 'HttpOnly', // js-cookie로 접근 가능하도록 주석 처리
                    `Max-Age=${30 * 24 * 60 * 60}`, // 30일
                    'SameSite=Lax', // CSRF 보호
                    isProduction ? 'Secure' : '' // HTTPS에서만 쿠키 전송
                ].filter(Boolean).join('; ');
                
                res.setHeader('Set-Cookie', cookieOptions);
                res.status(200).json({ message: "Login successful", data: authToken });
            } else {
                res.status(401).json({ message: "Login failed" });
            }
        } catch (error) {
            console.error("Login error:", error);
            res.status(401).json({ message: "Login failed" });
        }
    } else if (req.method === "GET" && req.query.type === "logout") {
        console.log('로그아웃 API 호출됨');
        
        // 로그아웃 시 쿠키 삭제 - 여러 방법 시도
        const isProduction = process.env.NODE_ENV === 'production';
        
        // 쿠키 삭제 옵션들
        const cookieDeleteOptions: string[] = [
            // 기본 삭제
            'auth=; Path=/; Max-Age=0',
            // 모든 옵션 포함
            `auth=; Path=/; Max-Age=0; SameSite=Lax${isProduction ? '; Secure' : ''}`,
            // expires 사용
            'auth=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT',
            // 도메인 포함 (localhost의 경우)
            req.headers.host?.includes('localhost') ? 'auth=; Path=/; Max-Age=0; Domain=localhost' : null,
        ].filter((option): option is string => option !== null);
        
        // 여러 Set-Cookie 헤더 설정
        res.setHeader('Set-Cookie', cookieDeleteOptions);
        
        console.log('쿠키 삭제 헤더 설정:', cookieDeleteOptions);
        
        res.status(200).json({ message: "Logout successful", data: "" });
    } else {
        res.status(405).json({ message: "Method not allowed" });
    }
}
