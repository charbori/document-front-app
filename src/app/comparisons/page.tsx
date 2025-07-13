"use client";

import {
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon
} from "@mui/icons-material";
import {
  Box,
  IconButton,
  Paper,
  Typography
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbar,
  type GridColDef,
} from "@mui/x-data-grid";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { api } from "../../services/api";

interface ComparisonData {
  id: number;
  diffTitle: string;
  diffType: string;
  originalDocumentId?: number;
  compareDocumentId?: number;
  createdAt: string;
  addedLines: number;
  deletedLines: number;
  modifiedLines: number;
  diffData: {
    statistics: {
      similarity: number;
      totalLines: number;
      addedLines: number;
      removedLines: number;
      modifiedLines: number;
    };
  };
}

interface DocumentData {
  id: number;
  title: string;
}

export default function ComparisonsPage() {
  const { t } = useTranslation();
  const router = useRouter();

  // State 관리
  const [comparisons, setComparisons] = useState<ComparisonData[]>([]);
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 데이터 로드
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 비교 결과와 문서 목록을 병렬로 로드
      const [comparisonsResult, documentsResult] = await Promise.all([
        api.compare.getDiffResultsRaw({
          _start: 0,
          _end: 100,
          _sort: "createdAt",
          _order: "desc",
        }),
        api.documents.getDocuments({
          _start: 0,
          _end: 1000,
        })
      ]);

      setComparisons(comparisonsResult.data);
      setDocuments(documentsResult.data);
    } catch (err: any) {
      console.error('데이터 로드 실패:', err);
      setError(err.message || '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  // 초기 데이터 로드
  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: number) => {
    if (confirm(t("messages.confirmDelete"))) {
      try {
        await api.compare.deleteDiffResult(id);
        // 삭제 후 목록 새로고침
        await loadData();
      } catch (err: any) {
        console.error('삭제 실패:', err);
        alert('삭제에 실패했습니다.');
      }
    }
  };

  const handleView = (comparison: ComparisonData) => {
    // 결과 전용 페이지로 이동
    router.push(`/compare/documents/${comparison.id}`);
  };

  const getStatusChip = (diffData: any) => {
    const similarity = diffData?.statistics?.similarity || 0;
    
    if (similarity >= 90) {
      return <span style={{ color: '#4caf50' }}>{t("comparisons.veryHigh")}</span>;
    } else if (similarity >= 70) {
      return <span style={{ color: '#2196f3' }}>{t("comparisons.high")}</span>;
    } else if (similarity >= 50) {
      return <span style={{ color: '#ff9800' }}>{t("comparisons.medium")}</span>;
    } else {
      return <span style={{ color: '#f44336' }}>{t("comparisons.low")}</span>;
    }
  };

  const getDocumentTitle = (id?: number) => {
    if (!id) return "-";
    const doc = documents.find(d => d.id === id);
    return doc?.title || `Document #${id}`;
  };

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "ID",
      width: 70,
    },
    {
      field: "diffTitle",
      headerName: t("comparisons.title"),
      flex: 1,
      minWidth: 200,
    },
    {
      field: "originalDocumentId",
      headerName: t("comparisons.originalDocument"),
      width: 200,
      renderCell: (params) => getDocumentTitle(params.value),
    },
    {
      field: "compareDocumentId",
      headerName: t("comparisons.compareDocument"),
      width: 200,
      renderCell: (params) => getDocumentTitle(params.value),
    },
    {
      field: "diffData",
      headerName: t("comparisons.similarity"),
      width: 120,
      renderCell: (params) => getStatusChip(params.value),
    },
    {
      field: "createdAt",
      headerName: t("table.createdAt"),
      width: 150,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: "actions",
      type: "actions",
      headerName: t("table.actions"),
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          key="view"
          icon={<ViewIcon />}
          label={t("actions.view")}
          onClick={() => handleView(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<DeleteIcon />}
          label={t("actions.delete")}
          onClick={() => handleDelete(params.row.id)}
        />,
      ],
    },
  ];

  if (error) {
    return (
      <Box sx={{ height: "100vh", width: "100%", p: 2 }}>
        <Typography color="error" variant="h6">
          오류: {error}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <IconButton onClick={loadData} color="primary">
            <RefreshIcon />
          </IconButton>
          다시 시도
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100vh", width: "100%", p: 2 }}>
      {/* 헤더 */}
      <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="h4">
          저장된 비교 결과
        </Typography>
        <IconButton onClick={loadData} color="primary" title="새로고침">
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* 데이터 그리드 */}
      <Paper sx={{ height: "calc(100vh - 150px)", width: "100%" }}>
        <DataGrid
          rows={comparisons}
          columns={columns}
          loading={loading}
          pageSizeOptions={[10, 20, 50]}
          checkboxSelection
          disableRowSelectionOnClick
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
        />
      </Paper>
    </Box>
  );
} 