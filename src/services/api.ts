import axios, { AxiosResponse } from 'axios';
import {
    ApiError,
    CompareDocumentsRequest,
    CompareTextRequest,
    CreateDocumentRequest,
    DiffResult,
    DiffResultsQueryParams,
    Document,
    DocumentsQueryParams,
    PaginatedResponse,
    UpdateDocumentRequest
} from '../types/api';

// API 기본 설정
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const API_PREFIX = '/api/diff';

// Axios 인스턴스 생성
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 인터셉터 설정 - 인증 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError: ApiError = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message || '알 수 없는 오류가 발생했습니다',
      details: error.response?.data,
    };
    return Promise.reject(apiError);
  }
);

// 문서 관련 API
export const documentApi = {
  // 문서 목록 조회
  getDocuments: async (params: DocumentsQueryParams = {}): Promise<PaginatedResponse<Document>> => {
    const response: AxiosResponse<Document[]> = await apiClient.get('/documents', { params });
    
    // 헤더에서 총 개수 추출 (일반적인 REST API 패턴)
    const total = parseInt(response.headers['x-total-count'] || '0');
    const start = params._start || 0;
    const end = params._end || 10;
    
    return {
      data: response.data,
      total,
      page: Math.floor(start / (end - start)) + 1,
      limit: end - start,
    };
  },

  // 특정 문서 조회
  getDocument: async (id: number): Promise<Document> => {
    const response: AxiosResponse<Document> = await apiClient.get(`/document/${id}`);
    return response.data;
  },

  // 문서 생성
  createDocument: async (data: CreateDocumentRequest): Promise<Document> => {
    const response: AxiosResponse<Document> = await apiClient.post('/document', data);
    return response.data;
  },

  // 문서 수정
  updateDocument: async (data: UpdateDocumentRequest): Promise<Document> => {
    const response: AxiosResponse<Document> = await apiClient.patch('/document', data);
    return response.data;
  },

  // 문서 삭제
  deleteDocument: async (id: number): Promise<void> => {
    await apiClient.delete(`/document/${id}`);
  },

  // 문서 제목 중복 확인
  validateDocumentTitle: async (title: string): Promise<{ isValid: boolean; message?: string }> => {
    try {
      await apiClient.get(`/document/validation/${encodeURIComponent(title)}`);
      return { isValid: true };
    } catch (error: any) {
      if (error.status === 409) {
        return { isValid: false, message: '이미 존재하는 제목입니다' };
      }
      return { isValid: true }; // 다른 에러는 검증 통과로 처리
    }
  },
};

// 비교 관련 API
export const compareApi = {
  // 문서 간 비교
  compareDocuments: async (data: CompareDocumentsRequest): Promise<DiffResult> => {
    const response: AxiosResponse<DiffResult> = await apiClient.post('/compare', data);
    return response.data;
  },

  // 텍스트 직접 비교
  compareText: async (data: CompareTextRequest): Promise<DiffResult> => {
    const response: AxiosResponse<DiffResult> = await apiClient.post('/compare', data);
    return response.data;
  },

  // Diff 결과 목록 조회
  getDiffResults: async (params: DiffResultsQueryParams = {}): Promise<PaginatedResponse<DiffResult>> => {
    const response: AxiosResponse<DiffResult[]> = await apiClient.get('/results', { params });
    
    const total = parseInt(response.headers['x-total-count'] || '0');
    const start = params._start || 0;
    const end = params._end || 10;
    
    return {
      data: response.data,
      total,
      page: Math.floor(start / (end - start)) + 1,
      limit: end - start,
    };
  },

  // 특정 Diff 결과 조회
  getDiffResult: async (id: number): Promise<DiffResult> => {
    const response: AxiosResponse<DiffResult> = await apiClient.get(`/result/${id}`);
    return response.data;
  },

  // Diff 결과 삭제
  deleteDiffResult: async (id: number): Promise<void> => {
    await apiClient.delete(`/result/${id}`);
  },
};

// 통합 API 객체
export const api = {
  documents: documentApi,
  compare: compareApi,
};

// 토큰 설정 함수
export const setAuthToken = (token: string) => {
  localStorage.setItem('auth_token', token);
};

// 토큰 제거 함수
export const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
  sessionStorage.removeItem('auth_token');
};

export default api; 