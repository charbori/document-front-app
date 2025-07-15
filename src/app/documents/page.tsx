"use client";

import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Visibility as ViewIcon,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbar,
  type GridColDef
} from "@mui/x-data-grid";
import {
  useCreate,
  useDelete,
  useList,
  useUpdate
} from "@refinedev/core";
import { useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { Document } from "../../types/api";

export default function DocumentsPage() {
  const { t } = useTranslation();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [viewingDocument, setViewingDocument] = useState<Document | null>(null);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Refine hooks
  const { data: documentsData, isLoading, refetch } = useList<Document>({
    resource: "documents",
    pagination: { current: 1, pageSize: 20 },
    sorters: [{ field: "createdAt", order: "desc" }],
    filters: [
      ...(searchText ? [{ field: "search", operator: "eq" as const, value: searchText }] : []),
      ...(statusFilter ? [{ field: "status", operator: "eq" as const, value: statusFilter }] : []),
    ],
  });

  const { mutate: createDocument } = useCreate();
  const { mutate: updateDocument } = useUpdate();
  const { mutate: deleteDocument } = useDelete();

  // 폼 상태
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    description: "",
    status: "DRAFT" as "DRAFT" | "PUBLISHED" | "ARCHIVED",
    fileName: "",
    fileType: "text" as "text" | "markdown" | "code",
    version: "1.0",
  });

  const handleOpenDialog = (document?: Document) => {
    if (document) {
      setEditingDocument(document);
      setFormData({
        title: document.title,
        content: document.content,
        description: document.description,
        status: document.status,
        fileName: document.fileName,
        fileType: document.fileType,
        version: document.version,
      });
    } else {
      setEditingDocument(null);
      setFormData({
        title: "",
        content: "",
        description: "",
        status: "DRAFT",
        fileName: "",
        fileType: "text",
        version: "1.0",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDocument(null);
  };

  const handleSave = () => {
    if (editingDocument) {
      updateDocument({
        resource: "documents",
        id: editingDocument.id,
        values: formData,
      }, {
        onSuccess: () => {
          handleCloseDialog();
          refetch();
        },
      });
    } else {
      createDocument({
        resource: "documents",
        values: formData,
      }, {
        onSuccess: () => {
          handleCloseDialog();
          refetch();
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm(t("messages.confirmDelete"))) {
      deleteDocument({
        resource: "documents",
        id,
      }, {
        onSuccess: () => {
          refetch();
        },
      });
    }
  };

  const handleView = (document: Document) => {
    setViewingDocument(document);
  };

  const handleSearch = () => {
    refetch();
  };

  const getStatusChip = (status: string) => {
    const statusColors = {
      DRAFT: "default" as const,
      PUBLISHED: "success" as const,
      ARCHIVED: "warning" as const,
    };

    const statusLabels = {
      DRAFT: t("status.draft"),
      PUBLISHED: t("status.published"),
      ARCHIVED: t("status.archived"),
    };

    return (
      <Chip
        label={statusLabels[status as keyof typeof statusLabels]}
        color={statusColors[status as keyof typeof statusColors]}
        size="small"
      />
    );
  };

  const formatFileSize = (size?: number) => {
    if (!size) return "-";
    const units = ["B", "KB", "MB", "GB"];
    let index = 0;
    let fileSize = size;
    
    while (fileSize >= 1024 && index < units.length - 1) {
      fileSize /= 1024;
      index++;
    }
    
    return `${fileSize.toFixed(1)} ${units[index]}`;
  };

  const columns: GridColDef[] = [
    {
      field: "title",
      headerName: t("documents.name"),
      flex: 1,
      minWidth: 200,
    },
    {
      field: "fileType",
      headerName: t("documents.type"),
      width: 100,
      renderCell: (params) => (
        <Chip label={params.value} variant="outlined" size="small" />
      ),
    },
    {
      field: "size",
      headerName: t("documents.size"),
      width: 100,
      renderCell: (params) => formatFileSize(params.value),
    },
    {
      field: "status",
      headerName: t("table.status"),
      width: 120,
      renderCell: (params) => getStatusChip(params.value),
    },
    {
      field: "version",
      headerName: t("documents.version"),
      width: 100,
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
          key="edit"
          icon={<EditIcon />}
          label={t("actions.edit")}
          onClick={() => handleOpenDialog(params.row)}
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

  return (
    <Box sx={{ height: "100vh", width: "100%", p: 2 }}>
      {/* 검색 및 필터 바 */}
      <Box sx={{ mb: 2, display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          placeholder={t("actions.search")}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="small"
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>{t("table.status")}</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            label={t("table.status")}
          >
            <MenuItem value="">
              <em>{t("actions.all")}</em>
            </MenuItem>
            <MenuItem value="DRAFT">{t("status.draft")}</MenuItem>
            <MenuItem value="PUBLISHED">{t("status.published")}</MenuItem>
            <MenuItem value="ARCHIVED">{t("status.archived")}</MenuItem>
          </Select>
        </FormControl>
        <IconButton onClick={handleSearch} color="primary">
          <SearchIcon />
        </IconButton>
        <IconButton onClick={() => refetch()} color="primary">
          <RefreshIcon />
        </IconButton>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          {t("actions.add")}
        </Button>
      </Box>
      {/* 데이터 그리드 */}
      <Paper sx={{ height: "calc(100vh - 150px)", width: "100%" }}>
        {!isLoading && (!documentsData?.data || documentsData.data.length === 0) ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              문서가 없습니다
            </Typography>
            <Typography variant="body2" color="text.secondary">
              새 문서를 추가하여 시작해보세요
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              {t("actions.add")}
            </Button>
          </Box>
        ) : (
          <DataGrid
            rows={documentsData?.data || []}
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
        )}
      </Paper>

      {/* 문서 추가/수정 다이얼로그 */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingDocument ? t("actions.edit") : t("actions.add")} {t("nav.documents")}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label={t("documents.name")}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label={t("form.description")}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <TextField
              label={t("documents.content")}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              fullWidth
              multiline
              rows={8}
              required
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                label={t("documents.version")}
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                sx={{ minWidth: 100 }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t("actions.cancel")}</Button>
          <Button onClick={handleSave} variant="contained">
            {t("actions.save")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 문서 보기 다이얼로그 */}
      <Dialog 
        open={!!viewingDocument} 
        onClose={() => setViewingDocument(null)} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          {viewingDocument?.title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {viewingDocument?.description}
            </Typography>
            <Paper 
              sx={{ 
                p: 2, 
                bgcolor: "grey.50", 
                fontFamily: "monospace",
                whiteSpace: "pre-wrap",
                maxHeight: 400,
                overflow: "auto"
              }}
            >
              {viewingDocument?.content}
            </Paper>
            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
              <Typography variant="caption">
                {t("documents.type")}: {viewingDocument?.fileType}
              </Typography>
              <Typography variant="caption">
                {t("documents.version")}: {viewingDocument?.version}
              </Typography>
              <Typography variant="caption">
                {t("table.status")}: {viewingDocument?.status}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewingDocument(null)}>
            {t("actions.close")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 