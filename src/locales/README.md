# 국제화 (i18n) 시스템 사용법

이 프로젝트는 자체 구현된 국제화 시스템을 사용합니다.

## 디렉토리 구조

```
src/
├── locales/
│   ├── index.ts       # 메인 설정 파일
│   ├── ko.ts          # 한국어 번역
│   ├── en.ts          # 영어 번역
│   └── README.md      # 사용법 문서
├── hooks/
│   └── useTranslation.ts  # 번역 훅
└── components/
    └── LanguageSwitcher.tsx  # 언어 전환 컴포넌트
```

## 기본 사용법

### 1. 컴포넌트에서 번역 사용하기

```tsx
"use client";

import { useTranslation } from "@/hooks/useTranslation";

export default function MyComponent() {
    const { t, locale, currentLanguage, changeLanguage } = useTranslation();

    return (
        <div>
            <h1>{t("meta.title")}</h1>
            <p>{t("documents.description")}</p>
            <button onClick={() => changeLanguage("en")}>
                {t("actions.save")}
            </button>
        </div>
    );
}
```

### 2. 변수가 포함된 번역 텍스트

```tsx
// 로케일 파일에서
export const ko = {
    messages: {
        welcome: "안녕하세요, {name}님!",
        fileSize: "파일 크기: {size}MB"
    }
};

// 컴포넌트에서
const message = t("messages.welcome", { name: "홍길동" });
const size = t("messages.fileSize", { size: "2.5" });
```

### 3. 언어 전환 컴포넌트 사용

```tsx
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

// 드롭다운 형태
<LanguageSwitcher variant="select" />

// 메뉴 형태
<LanguageSwitcher variant="menu" />
```

## 새로운 언어 추가하기

### 1. 새 언어 파일 생성

`src/locales/ja.ts` (일본어 예시):
```tsx
export const ja = {
    meta: {
        title: "文書管理システム",
        description: "文書ビューアおよび比較システム",
    },
    // ... 다른 번역들
};
```

### 2. 메인 설정 파일 업데이트

`src/locales/index.ts`:
```tsx
import { ko } from './ko';
import { en } from './en';
import { ja } from './ja';  // 추가

export type Language = 'ko' | 'en' | 'ja';  // 추가

export const locales = {
    ko,
    en,
    ja,  // 추가
};

export const AVAILABLE_LANGUAGES = [
    { code: 'ko', name: '한국어' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },  // 추가
] as const;
```

## 번역 키 구조

번역 키는 계층적 구조로 구성됩니다:

```
meta.title                     → 메타데이터
nav.documents                  → 네비게이션
actions.save                   → 액션/버튼
status.pending                 → 상태
documents.name                 → 문서 관련
comparisons.startComparison    → 비교 관련
viewer.zoomIn                  → 뷰어 관련
auth.login                     → 인증 관련
messages.success               → 메시지
form.required                  → 폼 관련
table.noRows                   → 테이블 관련
```

## 번역 텍스트 추가하기

### 1. 로케일 파일에 새 키 추가

```tsx
// ko.ts
export const ko = {
    // 기존 키들...
    newSection: {
        newKey: "새로운 번역 텍스트",
    },
};

// en.ts
export const en = {
    // 기존 키들...
    newSection: {
        newKey: "New translation text",
    },
};
```

### 2. 컴포넌트에서 사용

```tsx
const text = t("newSection.newKey");
```

## 주의사항

1. **일관성**: 모든 언어 파일에서 동일한 키 구조를 유지해야 합니다.
2. **타입 안전성**: TypeScript를 통해 번역 키의 타입 안전성이 보장됩니다.
3. **기본 언어**: 번역이 없는 경우 키 자체가 반환됩니다.
4. **로컬 스토리지**: 선택한 언어는 브라우저의 로컬 스토리지에 저장됩니다.
5. **SSR 호환**: 클라이언트 사이드에서만 동작하므로 "use client" 지시문이 필요합니다.

## 번역 키 네이밍 규칙

- **camelCase** 사용
- **계층적 구조** 유지
- **의미있는 이름** 사용
- **일관된 패턴** 유지

```
✅ Good:
documents.uploadSuccess
comparisons.startComparison
auth.verificationFailed

❌ Bad:
upload_success
start-comparison
verification_failed_message
``` 