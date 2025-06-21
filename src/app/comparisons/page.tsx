"use client";

import {
    Compare as CompareIcon,
    Delete as DeleteIcon,
    Refresh as RefreshIcon,
    Visibility as ViewIcon
} from "@mui/icons-material";
import {
    Autocomplete,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Tab,
    Tabs,
    TextField,
    Typography
} from "@mui/material";
import {
    DataGrid,
    GridActionsCellItem,
    GridToolbar,
    type GridColDef,
} from "@mui/x-data-grid";
import {
    useCreate,
    useDelete,
    useList,
} from "@refinedev/core";
import React, { useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { DiffResult, Document } from "../../types/api";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ComparisonsPage() {
  const { t } = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const [viewingComparison, setViewingComparison] = useState<DiffResult | null>(null);
  const [tabValue, setTabValue] = useState(0);

  // Refine hooks
  const { data: comparisonsData, isLoading, refetch } = useList<DiffResult>({
    resource: "comparisons",
    pagination: { current: 1, pageSize: 20 },
    sorters: [{ field: "createdAt", order: "desc" }],
  });

  const { data: documentsData } = useList<Document>({
    resource: "documents",
    pagination: { current: 1, pageSize: 1000 }, // 모든 문서 가져오기
  });

  const { mutate: createComparison } = useCreate();
  const { mutate: deleteComparison } = useDelete();

  // 폼 상태
  const [documentCompareForm, setDocumentCompareForm] = useState({
    originalDocumentId: null as number | null,
    compareDocumentId: null as number | null,
    diffTitle: "",
  });

  const [textCompareForm, setTextCompareForm] = useState({
    originalText: "",
    compareText: "",
    diffTitle: "",
  });

  const handleOpenDialog = () => {
    setDocumentCompareForm({
      originalDocumentId: null,
      compareDocumentId: null,
      diffTitle: "",
    });
    setTextCompareForm({
      originalText: "",
      compareText: "",
      diffTitle: "",
    });
    setTabValue(0);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleDocumentCompare = () => {
    if (!documentCompareForm.originalDocumentId || !documentCompareForm.compareDocumentId) {
      alert(t("messages.selectDocuments"));
      return;
    }

    createComparison({
      resource: "comparisons",
      values: {
        ...documentCompareForm,
        diffType: "text",
      },
    }, {
      onSuccess: () => {
        handleCloseDialog();
        refetch();
      },
    });
  };

  const handleTextCompare = () => {
    if (!textCompareForm.originalText || !textCompareForm.compareText) {
      alert(t("messages.enterTexts"));
      return;
    }

    createComparison({
      resource: "comparisons",
      values: {
        ...textCompareForm,
        diffType: "text",
      },
    }, {
      onSuccess: () => {
        handleCloseDialog();
        refetch();
      },
    });
  };

  const handleDelete = (id: number) => {
    if (confirm(t("messages.confirmDelete"))) {
      deleteComparison({
        resource: "comparisons",
        id,
      }, {
        onSuccess: () => {
          refetch();
        },
      });
    }
  };

  const handleView = (comparison: DiffResult) => {
    setViewingComparison(comparison);
  };

  const getStatusChip = (diffData: any) => {
    const similarity = diffData?.statistics?.similarity || 0;
    
    if (similarity >= 90) {
      return <Chip label={t("comparisons.veryHigh")} color="success" size="small" />;
    } else if (similarity >= 70) {
      return <Chip label={t("comparisons.high")} color="info" size="small" />;
    } else if (similarity >= 50) {
      return <Chip label={t("comparisons.medium")} color="warning" size="small" />;
    } else {
      return <Chip label={t("comparisons.low")} color="error" size="small" />;
    }
  };

  const getDocumentTitle = (id?: number) => {
    if (!id) return "-";
    const doc = documentsData?.data.find(d => d.id === id);
    return doc?.title || `Document #${id}`;
  };

  const columns: GridColDef[] = [
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

  const documents = documentsData?.data || [];

  return (
    <Box sx={{ height: "100vh", width: "100%", p: 2 }}>
      {/* 액션 바 */}
      <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center" }}>
        <IconButton onClick={() => refetch()} color="primary">
          <RefreshIcon />
        </IconButton>
        <Button
          variant="contained"
          startIcon={<CompareIcon />}
          onClick={handleOpenDialog}
        >
          {t("comparisons.newComparison")}
        </Button>
      </Box>

      {/* 데이터 그리드 */}
      <Paper sx={{ height: "calc(100vh - 150px)", width: "100%" }}>
        <DataGrid
          rows={comparisonsData?.data || []}
          columns={columns}
          loading={isLoading}
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

      {/* 비교 생성 다이얼로그 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {t("comparisons.newComparison")}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label={t("comparisons.documentCompare")} />
              <Tab label={t("comparisons.textCompare")} />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label={t("comparisons.title")}
                value={documentCompareForm.diffTitle}
                onChange={(e) => setDocumentCompareForm({ 
                  ...documentCompareForm, 
                  diffTitle: e.target.value 
                })}
                fullWidth
                required
              />
              <Autocomplete
                options={documents}
                getOptionLabel={(option) => option.title}
                renderInput={(params) => (
                  <TextField {...params} label={t("comparisons.originalDocument")} required />
                )}
                value={documents.find(d => d.id === documentCompareForm.originalDocumentId) || null}
                onChange={(e, value) => setDocumentCompareForm({
                  ...documentCompareForm,
                  originalDocumentId: value?.id || null
                })}
              />
              <Autocomplete
                options={documents}
                getOptionLabel={(option) => option.title}
                renderInput={(params) => (
                  <TextField {...params} label={t("comparisons.compareDocument")} required />
                )}
                value={documents.find(d => d.id === documentCompareForm.compareDocumentId) || null}
                onChange={(e, value) => setDocumentCompareForm({
                  ...documentCompareForm,
                  compareDocumentId: value?.id || null
                })}
              />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label={t("comparisons.title")}
                value={textCompareForm.diffTitle}
                onChange={(e) => setTextCompareForm({ 
                  ...textCompareForm, 
                  diffTitle: e.target.value 
                })}
                fullWidth
                required
              />
              <TextField
                label={t("comparisons.originalText")}
                value={textCompareForm.originalText}
                onChange={(e) => setTextCompareForm({ 
                  ...textCompareForm, 
                  originalText: e.target.value 
                })}
                fullWidth
                multiline
                rows={6}
                required
              />
              <TextField
                label={t("comparisons.compareText")}
                value={textCompareForm.compareText}
                onChange={(e) => setTextCompareForm({ 
                  ...textCompareForm, 
                  compareText: e.target.value 
                })}
                fullWidth
                multiline
                rows={6}
                required
              />
            </Box>
          </TabPanel>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t("actions.cancel")}</Button>
          <Button 
            onClick={tabValue === 0 ? handleDocumentCompare : handleTextCompare} 
            variant="contained"
          >
            {t("comparisons.startComparison")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 비교 결과 보기 다이얼로그 */}
      <Dialog 
        open={!!viewingComparison} 
        onClose={() => setViewingComparison(null)} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          {viewingComparison?.diffTitle}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            {/* 비교 정보 */}
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <Typography variant="body2">
                {t("comparisons.originalDocument")}: {getDocumentTitle(viewingComparison?.originalDocumentId)}
              </Typography>
              <Typography variant="body2">
                {t("comparisons.compareDocument")}: {getDocumentTitle(viewingComparison?.compareDocumentId)}
              </Typography>
            </Box>

            {/* 통계 정보 */}
            {viewingComparison?.diffData?.statistics && (
              <Paper sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {t("comparisons.statistics")}
                </Typography>
                <Box sx={{ display: "flex", gap: 3 }}>
                  <Typography variant="body2">
                    {t("comparisons.similarity")}: {viewingComparison.diffData.statistics.similarity}%
                  </Typography>
                  <Typography variant="body2">
                    {t("comparisons.totalLines")}: {viewingComparison.diffData.statistics.totalLines}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    +{viewingComparison.diffData.statistics.addedLines}
                  </Typography>
                  <Typography variant="body2" color="error.main">
                    -{viewingComparison.diffData.statistics.removedLines}
                  </Typography>
                  <Typography variant="body2" color="warning.main">
                    ~{viewingComparison.diffData.statistics.modifiedLines}
                  </Typography>
                </Box>
              </Paper>
            )}

            {/* 변경 사항 */}
            {viewingComparison?.diffData?.changes && (
              <Paper sx={{ p: 2, maxHeight: 400, overflow: "auto" }}>
                <Typography variant="h6" gutterBottom>
                  {t("comparisons.changes")}
                </Typography>
                {viewingComparison.diffData.changes.map((change, index) => (
                  <Box 
                    key={index}
                    sx={{ 
                      p: 1, 
                      mb: 1,
                      bgcolor: change.type === 'added' ? 'success.light' : 
                               change.type === 'removed' ? 'error.light' :
                               change.type === 'modified' ? 'warning.light' : 'transparent',
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Line {change.lineNumber}: 
                    </Typography>
                    <Typography component="span" sx={{ ml: 1 }}>
                      {change.content}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            )}

            {/* 요약 */}
            {viewingComparison?.diffData?.summary && (
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  {t("comparisons.summary")}
                </Typography>
                <Typography variant="body2">
                  {viewingComparison.diffData.summary}
                </Typography>
              </Paper>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewingComparison(null)}>
            {t("actions.close")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 