"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { AppIcon } from "@components/app-icon";
import { Header } from "@components/header";
import {
    CompareArrows as CompareIcon,
    Logout as LogoutIcon
} from "@mui/icons-material";
import {
    Box,
    Button,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText
} from "@mui/material";
import { useLogout } from "@refinedev/core";
import {
    ThemedLayoutV2,
    ThemedSiderV2,
    ThemedTitleV2
} from "@refinedev/mui";
import Link from "next/link";
import React from "react";

export const ThemedLayout = ({ children }: React.PropsWithChildren) => {
    const { t } = useTranslation();
    const { mutate: logout } = useLogout();
    
    // 로그아웃 핸들러
    const handleLogout = async () => {
        console.log('[ThemedLayout] 로그아웃 버튼 클릭됨');
        
        try {
            // useLogout 훅의 mutate 함수를 호출하여 authProvider.logout 실행
            await logout({
                redirectPath: "/login", // 명시적으로 리다이렉트 경로 설정
            });
            console.log('[ThemedLayout] 로그아웃 완료');
        } catch (error) {
            console.error('[ThemedLayout] 로그아웃 중 오류:', error);
        }
    };
    
    return (
        <ThemedLayoutV2
            Header={() => <Header sticky />}
            Sider={(props) => (
                <ThemedSiderV2
                    {...props}
                    Title={({ collapsed }) => (
                        <ThemedTitleV2
                            collapsed={collapsed}
                            text={t("meta.title")}
                            icon={<AppIcon />}
                        />
                    )}
                    render={({ items, logout: defaultLogout, collapsed }) => {
                        // logout 항목 필터링
                        const filteredItems = React.Children.toArray(items).filter(
                            (item: any) => {
                                // logout 관련 항목 제거
                                const itemProps = item?.props;
                                const isLogout = itemProps?.name === 'logout' || 
                                               itemProps?.onClick?.toString().includes('logout') ||
                                               itemProps?.children?.toLowerCase?.().includes('logout');
                                return !isLogout;
                            }
                        );
                        
                        return (
                            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                                {/* 기본 메뉴 아이템 (문서, 문서 비교) */}
                                <List sx={{ flex: 1 }}>
                                    {filteredItems}
                                </List>
                                
                                <Divider />
                                
                                {/* 문서 비교 도구 링크 */}
                                <List>
                                    <ListItemButton 
                                        component={Link} 
                                        href="/compare"
                                        sx={{ 
                                            px: collapsed ? 1 : 2,
                                            py: 1.5,
                                            justifyContent: collapsed ? 'center' : 'flex-start'
                                        }}
                                        title={collapsed ? "문서 비교 도구" : undefined}
                                    >
                                        <ListItemIcon sx={{ minWidth: collapsed ? 'auto' : 56 }}>
                                            <CompareIcon />
                                        </ListItemIcon>
                                        {!collapsed && (
                                            <ListItemText 
                                                primary="문서 비교 도구"
                                            />
                                        )}
                                    </ListItemButton>
                                </List>
                                
                                <Divider />
                                
                                {/* 하단 로그아웃 버튼 */}
                                <Box sx={{ p: collapsed ? 1 : 2 }}>
                                    <Button
                                        fullWidth
                                        variant="outlined"
                                        color="error"
                                        startIcon={!collapsed ? <LogoutIcon /> : undefined}
                                        onClick={handleLogout}
                                        sx={{ 
                                            justifyContent: collapsed ? 'center' : 'flex-start',
                                            pl: collapsed ? 0 : 2,
                                            minWidth: collapsed ? 'auto' : undefined
                                        }}
                                        title={collapsed ? t("nav.logout") : undefined}
                                    >
                                        {collapsed ? <LogoutIcon /> : t("nav.logout")}
                                    </Button>
                                </Box>
                            </Box>
                        );
                    }}
                />
            )}
        >
            {children}
        </ThemedLayoutV2>
    );
};
