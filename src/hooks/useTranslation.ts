"use client";

import { useEffect, useState } from 'react';
import { DEFAULT_LANGUAGE, Language, LocaleKeys, locales } from '../locales';

// 로컬스토리지 키
const LANGUAGE_STORAGE_KEY = 'preferred_language';

// 중첩된 객체에서 키로 값을 가져오는 헬퍼 함수
function getNestedValue(obj: any, path: string): string {
  return path.split('.').reduce((current, key) => current?.[key], obj) || path;
}

// 문자열 템플릿 변수 치환 함수
function interpolate(template: string, variables: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return variables[key]?.toString() || match;
  });
}

export function useTranslation() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(DEFAULT_LANGUAGE);

  // 컴포넌트 마운트 시 저장된 언어 설정 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
      if (savedLanguage && locales[savedLanguage]) {
        setCurrentLanguage(savedLanguage);
      }
    }
  }, []);

  // 언어 변경 함수
  const changeLanguage = (language: Language) => {
    setCurrentLanguage(language);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    }
  };

  // 번역 함수
  const t = (key: string, variables?: Record<string, string | number>): string => {
    const currentLocale = locales[currentLanguage];
    const value = getNestedValue(currentLocale, key);
    return variables ? interpolate(value, variables) : value;
  };

  // 현재 언어의 전체 로케일 데이터 반환
  const locale = locales[currentLanguage] as LocaleKeys;

  return {
    t,
    locale,
    currentLanguage,
    changeLanguage,
  };
} 