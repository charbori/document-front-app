"use client";

import { DataProvider } from "@refinedev/core";
import { api } from "../../services/api";

// 커스텀 데이터 프로바이더 구현
export const dataProvider: DataProvider = {
  getApiUrl: () => "/api/diff",

  // 리스트 조회
  getList: async ({ resource, pagination, sorters, filters }) => {
    try {
      if (resource === "documents") {
        const params = {
          _start: pagination?.current ? (pagination.current - 1) * (pagination.pageSize || 10) : 0,
          _end: pagination?.current ? pagination.current * (pagination.pageSize || 10) : 10,
          _sort: sorters?.[0]?.field || "createdAt",
          _order: sorters?.[0]?.order || "desc",
          ...(filters?.reduce((acc, filter) => {
            if (filter.operator === "eq") {
              if ((filter as any).field === "status" && filter.value) {
                acc.status = filter.value;
              }
              if ((filter as any).field === "search" && filter.value) {
                acc.search = filter.value;
              }
            }
            return acc;
          }, {} as any) || {}),
        };

        const response = await api.documents.getDocuments(params);
        return {
          data: response.data as any[],
          total: response.total,
        };
      }

      if (resource === "comparisons") {
        const params = {
          _start: pagination?.current ? (pagination.current - 1) * (pagination.pageSize || 10) : 0,
          _end: pagination?.current ? pagination.current * (pagination.pageSize || 10) : 10,
          _sort: sorters?.[0]?.field || "createdAt",
          _order: sorters?.[0]?.order || "desc",
        };

        const response = await api.compare.getDiffResultsRaw(params);
        return {
          data: response.data as any[],
          total: response.total,
        };
      }

      return { data: [], total: 0 };
    } catch (error) {
      console.error(`Error fetching ${resource}:`, error);
      throw error;
    }
  },

  // 단일 조회
  getOne: async ({ resource, id }) => {
    try {
      if (resource === "documents") {
        const data = await api.documents.getDocument(Number(id));
        return { data: data as any };
      }

      if (resource === "comparisons") {
        try {
          const data = await api.compare.getDiffResult(Number(id));
          return { data: data as any };
        } catch (error: any) {
          console.error(`Error fetching comparison ${id}:`, error);
          // 에러가 발생해도 기본 구조 반환
          throw error;
        }
      }

      throw new Error(`Resource ${resource} not supported`);
    } catch (error) {
      console.error(`Error fetching ${resource} with id ${id}:`, error);
      throw error;
    }
  },

  // 생성
  create: async ({ resource, variables }) => {
    try {
      if (resource === "documents") {
        const data = await api.documents.createDocument(variables as any);
        return { data: data as any };
      }

      if (resource === "comparisons") {
        // 문서 간 비교 또는 텍스트 직접 비교
        const vars = variables as any;
        if (vars.originalDocumentId && vars.compareDocumentId) {
          const data = await api.compare.compareDocuments(vars);
          return { data: data as any };
        } else if (vars.originalText && vars.compareText) {
          const data = await api.compare.compareText(vars);
          return { data: data as any };
        }
      }

      throw new Error(`Resource ${resource} not supported for creation`);
    } catch (error) {
      console.error(`Error creating ${resource}:`, error);
      throw error;
    }
  },

  // 수정
  update: async ({ resource, id, variables }) => {
    try {
      if (resource === "documents") {
        const data = await api.documents.updateDocument({
          id: Number(id),
          ...variables,
        } as any);
        return { data: data as any };
      }

      throw new Error(`Resource ${resource} not supported for update`);
    } catch (error) {
      console.error(`Error updating ${resource} with id ${id}:`, error);
      throw error;
    }
  },

  // 삭제
  deleteOne: async ({ resource, id }) => {
    try {
      if (resource === "documents") {
        await api.documents.deleteDocument(Number(id));
        return { data: { id } as any };
      }

      if (resource === "comparisons") {
        await api.compare.deleteDiffResult(Number(id));
        return { data: { id } as any };
      }

      throw new Error(`Resource ${resource} not supported for deletion`);
    } catch (error) {
      console.error(`Error deleting ${resource} with id ${id}:`, error);
      throw error;
    }
  },

  // 다중 조회 (필요한 경우)
  getMany: async ({ resource, ids }) => {
    try {
      const promises = ids.map((id) =>
        resource === "documents"
          ? api.documents.getDocument(Number(id))
          : api.compare.getDiffResult(Number(id))
      );

      const data = await Promise.all(promises);
      return { data: data as any[] };
    } catch (error) {
      console.error(`Error fetching multiple ${resource}:`, error);
      throw error;
    }
  },

  // 커스텀 API 호출
  custom: async ({ url, method, payload, query, headers }) => {
    // 필요한 경우 커스텀 API 호출 구현
    throw new Error("Custom API calls not implemented");
  },
};
