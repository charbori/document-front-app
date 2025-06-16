import { en } from './en';
import { ko } from './ko';

export type Language = 'ko' | 'en';

export const locales = {
  ko,
  en,
};

export type LocaleKeys = typeof ko;

// 기본 언어 설정
export const DEFAULT_LANGUAGE: Language = 'ko';

// 사용 가능한 언어 목록
export const AVAILABLE_LANGUAGES = [
  { code: 'ko', name: '한국어' },
  { code: 'en', name: 'English' },
] as const; 