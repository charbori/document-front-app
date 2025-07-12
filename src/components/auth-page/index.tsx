"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { AppIcon } from "@components/app-icon";
import { Compare as CompareIcon } from "@mui/icons-material";
import { Alert, Box, Button, Divider, Typography } from "@mui/material";
import { AuthPageProps } from "@refinedev/core";
import { AuthPage as AuthPageBase, ThemedTitleV2 } from "@refinedev/mui";
import Link from "next/link";
import { useEffect, useState } from "react";

export const AuthPage = (props: AuthPageProps) => {
    const { t } = useTranslation();
    const [loginInfo, setLoginInfo] = useState<string | null>(null);
    const [apiEndpoint, setApiEndpoint] = useState<string>("");
    
    // 컴포넌트 마운트 시 로그인 정보 표시
    useEffect(() => {
        if (props.type === "login") {
            // 개발 환경에서 테스트 계정 정보 표시
            if (process.env.NODE_ENV === 'development') {
                setLoginInfo("테스트 계정: test@naver.com / testtest1124");
                
                // API 엔드포인트 정보 표시
                const endpoint = process.env.NEXT_PUBLIC_LOGIN_API_ENDPOINT || 
                               'http://localhost:8080/api/v1/auth/login';
                setApiEndpoint(endpoint);
            }
        }
    }, [props.type]);
    
    return (
        <Box>
            {/* 로그인 정보 안내 */}
            {props.type === "login" && loginInfo && (
                <Box sx={{ 
                    maxWidth: '400px', 
                    mx: 'auto', 
                    mb: 2,
                    px: 2
                }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                            {loginInfo}
                        </Typography>
                        {apiEndpoint && (
                            <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.8 }}>
                                API: {apiEndpoint}
                            </Typography>
                        )}
                    </Alert>
                </Box>
            )}
            
            <AuthPageBase
                {...props}
                formProps={{
                    defaultValues: { 
                        email: process.env.NODE_ENV === 'development' ? "test@naver.com" : "", 
                        password: process.env.NODE_ENV === 'development' ? "testtest1124" : "" 
                    },
                }}
                title={
                    <ThemedTitleV2
                        collapsed={false}
                        text={t("meta.title")}
                        icon={<AppIcon />}
                    />
                }
                renderContent={(content, title) => (
                    <Box>
                        {title}
                        {content}
                        
                        {/* 추가 정보 표시 */}
                        {props.type === "login" && (
                            <Box sx={{ 
                                maxWidth: '400px', 
                                mx: 'auto', 
                                mt: 2, 
                                px: 2,
                                textAlign: 'center'
                            }}>
                                <Typography variant="body2" color="text.secondary">
                                    로그인 후 JWT 토큰이 자동으로 쿠키에 저장됩니다
                                </Typography>
                            </Box>
                        )}
                    </Box>
                )}
            />
            
            {/* 비교 도구 링크 추가 */}
            {props.type === "login" && (
                <Box sx={{ 
                    maxWidth: '400px', 
                    mx: 'auto', 
                    mt: 3, 
                    p: 2,
                    textAlign: 'center'
                }}>
                    <Divider sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            또는
                        </Typography>
                    </Divider>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        로그인 없이 문서 비교 기능을 사용할 수 있습니다
                    </Typography>
                    
                    <Button
                        component={Link}
                        href="/compare"
                        variant="outlined"
                        fullWidth
                        startIcon={<CompareIcon />}
                        sx={{ py: 1.5 }}
                    >
                        문서 비교 도구 사용하기
                    </Button>
                </Box>
            )}
        </Box>
    );
};
