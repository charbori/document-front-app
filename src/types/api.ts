// API 기본 응답 타입
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// 페이지네이션 응답 타입
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// 문서 관련 타입
export interface Document {
  id: number;
  title: string;
  content: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  fileName: string;
  fileType: 'text' | 'markdown' | 'code';
  version: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  size?: number;
}

export interface CreateDocumentRequest {
  title: string;
  content: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  fileName: string;
  fileType: 'text' | 'markdown' | 'code';
  version: string;
}

export interface UpdateDocumentRequest extends Partial<CreateDocumentRequest> {
  id: number;
}

// 비교 관련 타입
export interface CompareDocumentsRequest {
  originalDocumentId: number;
  compareDocumentId: number;
  diffTitle: string;
  diffType: 'text';
}

export interface CompareTextRequest {
  originalText: string;
  compareText: string;
  diffTitle: string;
  diffType: 'text';
}

export interface DiffResult {
  id: number;
  diffTitle: string;
  diffType: 'text';
  originalDocumentId?: number;
  compareDocumentId?: number;
  originalText?: string;
  compareText?: string;
  diffData: DiffData;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface DiffData {
  changes: DiffChange[];
  statistics: DiffStatistics;
  summary: string;
}

export interface DiffChange {
  type: 'added' | 'removed' | 'modified' | 'unchanged';
  lineNumber: number;
  content: string;
  originalLine?: number;
  compareLine?: number;
}

export interface DiffStatistics {
  totalLines: number;
  addedLines: number;
  removedLines: number;
  modifiedLines: number;
  similarity: number;
}

// 검색 및 필터링 파라미터
export interface DocumentsQueryParams {
  _start?: number;
  _end?: number;
  _sort?: string;
  _order?: 'asc' | 'desc';
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  search?: string;
}

export interface DiffResultsQueryParams {
  _start?: number;
  _end?: number;
  _sort?: string;
  _order?: 'asc' | 'desc';
}

// 에러 타입
export interface ApiError {
  status: number;
  message: string;
  details?: any;
} 