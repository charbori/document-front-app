"use client";

import React, { createContext, useContext } from "react";

interface AuthData {
  authenticated: boolean;
  userIdentity: any;
}

interface ComparePageContextType {
  authData: AuthData;
  logout: () => Promise<void>;
}

const ComparePageContext = createContext<ComparePageContextType | undefined>(undefined);

export function ComparePageProvider({ 
  children, 
  authData 
}: { 
  children: React.ReactNode;
  authData: AuthData;
}) {
  const logout = async () => {
    try {
      // 로그아웃 API 호출
      await fetch('/api/auth?type=logout', {
        method: 'GET',
        credentials: 'include'
      });
      
      // 쿠키 삭제
      document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      
      // 페이지 새로고침
      window.location.reload();
    } catch (error) {
      console.error('로그아웃 오류:', error);
      // 에러가 발생해도 클라이언트에서 쿠키 삭제
      document.cookie = 'auth=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      window.location.reload();
    }
  };

  return (
    <ComparePageContext.Provider value={{ authData, logout }}>
      {children}
    </ComparePageContext.Provider>
  );
}

export function useComparePageContext() {
  const context = useContext(ComparePageContext);
  if (!context) {
    throw new Error('useComparePageContext must be used within ComparePageProvider');
  }
  return context;
} 