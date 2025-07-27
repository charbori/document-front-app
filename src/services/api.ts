import axios, { AxiosResponse } from 'axios';
import {
  ApiError,
  BackendDiffResult,
  CompareDocumentsRequest,
  CompareTextRequest,
  CreateDocumentRequest,
  DiffChange,
  DiffData,
  DiffResult,
  DiffResultsQueryParams,
  DiffStatistics,
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

// 백엔드 응답을 프론트엔드 형식으로 변환하는 핸들러
const transformBackendDiffResult = (backendResult: BackendDiffResult): DiffResult => {

  // diffResult 문자열을 라인별로 분할하여 DiffChange 배열로 변환
  const diffLines = backendResult.diffResult.split('\n');
  
  const diffChanges: DiffChange[] = diffLines
    .filter(line => line.length > 0) // 빈 라인 제거
    .map((line, index) => {
      let type: 'added' | 'removed' | 'unchanged';
      let content: string;
      
      // 라인의 첫 글자로 operation 판단
      if (line.startsWith('+')) {
        type = 'added';
        content = line.substring(1); // + 제거
      } else if (line.startsWith('-')) {
        type = 'removed';
        content = line.substring(1); // - 제거
      } else {
        type = 'unchanged';
        content = line.startsWith('  ') ? line.substring(2) : line; // 공백 2개 제거 (있는 경우)
      }

      return {
        type,
        lineNumber: index + 1,
        content,
        originalLine: index + 1,
        compareLine: index + 1,
      };
    });

  // 통계 계산 (실제 분석된 라인 기준)
  const totalLines = diffChanges.length;
  const addedLines = diffChanges.filter(change => change.type === 'added').length;
  const removedLines = diffChanges.filter(change => change.type === 'removed').length;
  const unchangedLines = diffChanges.filter(change => change.type === 'unchanged').length;

  // 유사도 계산 (변경되지 않은 줄의 비율)
  const similarity = totalLines > 0 ? unchangedLines / totalLines : 1;

  const statistics: DiffStatistics = {
    totalLines,
    addedLines,
    removedLines,
    modifiedLines: 0, // modified는 더 이상 사용하지 않음
    similarity,
  };

  // 요약 생성
  let summary = '';
  if (addedLines === 0 && removedLines === 0) {
    summary = '두 문서가 완전히 동일합니다.';
  } else {
    const changesList = [];
    if (addedLines > 0) changesList.push(`${addedLines}줄 추가`);
    if (removedLines > 0) changesList.push(`${removedLines}줄 삭제`);
    summary = `${changesList.join(', ')}되었습니다. 유사도: ${(similarity * 100).toFixed(1)}%`;
  }

  const diffData: DiffData = {
    changes: diffChanges,
    statistics,
    summary,
  };

  // 프론트엔드 형식으로 변환
  const frontendResult: DiffResult = {
    id: backendResult.id,
    diffTitle: backendResult.diffTitle,
    diffType: 'text',
    originalDocumentId: backendResult.originalDocument?.id,
    compareDocumentId: backendResult.compareDocument?.id,
    originalText: backendResult.originalDocument?.content,
    compareText: backendResult.compareDocument?.content,
    diffData,
    createdAt: backendResult.createdAt,
    updatedAt: backendResult.createdAt, // 백엔드에 updatedAt이 없으면 createdAt 사용
    createdBy: backendResult.user?.username,
    addedLines,
    deletedLines: removedLines,
    modifiedLines: 0,
  };

  return frontendResult;
};

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

// 응답 인터셉터 - 인증 및 에러 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 에러 (인증 실패/토큰 만료) 처리
    if (error.response?.status === 401) {
      console.warn('인증 토큰이 만료되었습니다. 로그인 페이지로 이동합니다.');
      
      // 토큰 제거
      removeAuthToken();
      
      // 쿠키에서도 토큰 제거 (클라이언트 사이드에서만)
      if (typeof window !== 'undefined') {
        import('js-cookie').then(({ default: Cookies }) => {
          Cookies.remove('auth', { path: '/' });
        });
        
        // 로그인 페이지로 리다이렉트 (compare 페이지는 제외)
        if (window.location.pathname !== '/login' && window.location.pathname !== '/compare') {
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `/login?to=${encodeURIComponent(currentPath)}`;
        }
      }
    }
    
    // API 에러 객체 생성
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
    const response: AxiosResponse<BackendDiffResult> = await apiClient.post('/compare', data);
    return transformBackendDiffResult(response.data);
  },

  // 텍스트 직접 비교
  compareText: async (data: CompareTextRequest): Promise<DiffResult> => {
    const response: AxiosResponse<BackendDiffResult> = await apiClient.post('/compare', data);
    return transformBackendDiffResult(response.data);
  },


  saveDiffResult: async (data: CompareTextRequest): Promise<DiffResult> => {
    const originalDocument = await documentApi.createDocument({
      title: data.diffTitle,
      content: data.originalText,
      description: data.diffTitle,
      status: 'DRAFT',
      fileName: data.originalText.slice(0, 10),
      fileType: 'text',
      version: '1.0',
    });

    const compareDocument = await documentApi.createDocument({
      title: data.diffTitle,
      content: data.compareText,
      description: data.diffTitle,
      status: 'DRAFT',
      fileName: data.compareText.slice(0, 10),
      fileType: 'text',
      version: '1.0',
    });

    const response: AxiosResponse<BackendDiffResult> = await apiClient.post('/compare',{
      originalDocumentId: originalDocument.id,
      compareDocumentId: compareDocument.id,
      diffTitle: data.diffTitle,
      diffType: 'text',
    });
    return transformBackendDiffResult(response.data);
  },

  // Diff 결과 목록 조회 (변환 적용)
  getDiffResults: async (params: DiffResultsQueryParams = {}): Promise<PaginatedResponse<DiffResult>> => {
    const response: AxiosResponse<BackendDiffResult[]> = await apiClient.get('/results', { params });
    
    const total = parseInt(response.headers['x-total-count'] || '0');
    const start = params._start || 0;
    const end = params._end || 10;
    
    return {
      data: response.data.map(transformBackendDiffResult),
      total,
      page: Math.floor(start / (end - start)) + 1,
      limit: end - start,
    };
  },

  // Diff 결과 목록 조회 (원본 데이터, /comparisons 페이지용)
  getDiffResultsRaw: async (params: DiffResultsQueryParams = {}): Promise<PaginatedResponse<any>> => {
    try {
      const response: AxiosResponse<any[]> = await apiClient.get('/results', { params });
      
      const total = parseInt(response.headers['x-total-count'] || '0');
      const start = params._start || 0;
      const end = params._end || 10;
      
      // 백엔드 데이터를 최소한의 변환만 적용
      const processedData = response.data.map((item: any) => ({
        id: item.id,
        diffTitle: item.diffTitle,
        diffType: item.diffType,
        originalDocumentId: item.originalDocument?.id,
        compareDocumentId: item.compareDocument?.id,
        createdAt: item.createdAt,
        addedLines: item.addedLines || 0,
        deletedLines: item.deletedLines || 0,
        modifiedLines: item.modifiedLines || 0,
        // 간단한 통계만 제공
        diffData: {
          statistics: {
            similarity: item.addedLines === 0 && item.deletedLines === 0 && item.modifiedLines === 0 ? 100 : 
                       Math.max(0, 100 - ((item.addedLines + item.deletedLines + item.modifiedLines) * 10)),
            totalLines: (item.addedLines || 0) + (item.deletedLines || 0) + (item.modifiedLines || 0),
            addedLines: item.addedLines || 0,
            removedLines: item.deletedLines || 0,
            modifiedLines: item.modifiedLines || 0,
          }
        }
      }));
      
      return {
        data: processedData,
        total,
        page: Math.floor(start / (end - start)) + 1,
        limit: end - start,
      };
    } catch (error: any) {
      console.error('getDiffResultsRaw 에러:', error);
      // 에러가 발생해도 빈 결과 반환
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      };
    }
  },

  // 특정 Diff 결과 조회
  getDiffResult: async (id: number): Promise<DiffResult> => {
    const response: AxiosResponse<BackendDiffResult> = await apiClient.get(`/result/${id}`);
    return transformBackendDiffResult(response.data);
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