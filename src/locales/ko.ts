export const ko = {
  // 메타데이터
  meta: {
    title: "문서 관리 시스템",
    description: "문서 뷰어 및 비교 시스템",
  },
  
  // 공통 메뉴/네비게이션
  nav: {
    documents: "문서",
    comparisons: "문서 비교",
    logout: "로그아웃",
    settings: "설정",
  },
  
  // 공통 액션/버튼
  actions: {
    save: "저장",
    cancel: "취소",
    delete: "삭제",
    edit: "편집",
    view: "보기",
    create: "생성",
    upload: "업로드",
    download: "다운로드",
    search: "검색",
    filter: "필터",
    close: "닫기",
    confirm: "확인",
    back: "뒤로",
    next: "다음",
    previous: "이전",
    refresh: "새로고침",
    print: "인쇄",
    fullscreen: "전체화면",
    compare: "비교",
    start: "시작",
  },
  
  // 상태
  status: {
    pending: "진행중",
    completed: "완료",
    failed: "실패",
    active: "활성",
    inactive: "비활성",
    loading: "로딩중...",
    success: "성공",
    error: "오류",
  },
  
  // 문서 관련
  documents: {
    title: "문서 관리",
    list: "문서 목록",
    upload: "문서 업로드",
    name: "문서명",
    type: "파일 형식",
    size: "파일 크기",
    category: "카테고리",
    uploadedAt: "업로드 날짜",
    actions: "작업",
    noDocuments: "문서가 없습니다",
    uploadSuccess: "문서가 성공적으로 업로드되었습니다",
    uploadFailed: "문서 업로드에 실패했습니다",
    deleteConfirm: "이 문서를 삭제하시겠습니까?",
    unsupportedFormat: "지원되지 않는 문서 형식입니다",
    textContent: "텍스트 문서 내용이 여기에 표시됩니다",
  },
  
  // 문서 비교 관련
  comparisons: {
    title: "문서 비교",
    newComparison: "새 문서 비교",
    list: "비교 목록",
    name: "비교 이름",
    document1: "첫 번째 문서",
    document2: "두 번째 문서",
    selectDocument1: "첫 번째 문서 선택",
    selectDocument2: "두 번째 문서 선택",
    startComparison: "비교 시작",
    viewResult: "결과 보기",
    comparisonResult: "비교 결과",
    summary: "비교 결과 요약",
    similarity: "유사도",
    differences: "차이점",
    differencesFound: "개 차이점 발견",
    sideBySide: "나란히 보기",
    overlay: "오버레이 보기",
    swapDocuments: "문서 위치 교체",
    downloadReport: "비교 보고서 다운로드",
    foundDifferences: "발견된 차이점",
    added: "추가됨",
    removed: "삭제됨",
    modified: "수정됨",
    page: "페이지",
    location: "위치",
    createdAt: "생성 날짜",
  },
  
  // 문서 뷰어 관련
  viewer: {
    zoomIn: "확대",
    zoomOut: "축소",
    rotateLeft: "왼쪽 회전",
    rotateRight: "오른쪽 회전",
    fullscreen: "전체화면",
    print: "인쇄",
    download: "다운로드",
    zoom: "확대/축소",
  },
  
  // 인증 관련
  auth: {
    login: "로그인",
    logout: "로그아웃",
    email: "이메일",
    password: "비밀번호",
    forgotPassword: "비밀번호 찾기",
    register: "회원가입",
    verification: "인증",
    loginRequired: "로그인이 필요합니다",
    invalidCredentials: "이메일 또는 비밀번호가 올바르지 않습니다",
    verificationSuccess: "회원 검증에 성공하였습니다. 로그인을 해주세요.",
    verificationFailed: "회원 검증에 실패하였습니다. 비밀번호 찾기를 통해 다시 확인해주세요.",
    findUser: "사용자 찾기",
  },
  
  // 공통 메시지
  messages: {
    success: "성공적으로 처리되었습니다",
    error: "오류가 발생했습니다",
    loading: "로딩중...",
    noData: "데이터가 없습니다",
    confirmDelete: "정말로 삭제하시겠습니까?",
    unsavedChanges: "저장되지 않은 변경사항이 있습니다",
  },
  
  // 폼 관련
  form: {
    required: "필수 항목입니다",
    invalid: "올바르지 않은 형식입니다",
    minLength: "최소 {min}자 이상 입력해주세요",
    maxLength: "최대 {max}자까지 입력 가능합니다",
    email: "올바른 이메일 주소를 입력해주세요",
  },
  
  // 테이블/그리드 관련
  table: {
    noRows: "데이터가 없습니다",
    loading: "데이터를 불러오는 중...",
    rowsPerPage: "페이지당 행 수",
    of: "중",
    page: "페이지",
  },
}; 