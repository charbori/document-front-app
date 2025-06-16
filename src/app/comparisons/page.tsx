"use client";

import { useTranslation } from "@/hooks/useTranslation";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Typography
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
    DeleteButton,
    List,
    ShowButton,
    useDataGrid,
} from "@refinedev/mui";
import React, { useState } from "react";

interface IComparison {
    id: string;
    name: string;
    document1: string;
    document2: string;
    status: "pending" | "completed" | "failed";
    createdAt: string;
    resultUrl?: string;
}

interface IDocument {
    id: string;
    name: string;
    type: string;
}

export default function ComparisonList() {
    const { t } = useTranslation();
    const { dataGridProps } = useDataGrid<IComparison>();
    const [selectedDoc1, setSelectedDoc1] = useState<string>("");
    const [selectedDoc2, setSelectedDoc2] = useState<string>("");
    
    // 예시 문서 목록 (실제로는 API에서 가져와야 함)
    const availableDocuments: IDocument[] = [
        { id: "1", name: "계약서_v1.pdf", type: "pdf" },
        { id: "2", name: "계약서_v2.pdf", type: "pdf" },
        { id: "3", name: "사업계획서.docx", type: "docx" },
        { id: "4", name: "제안서.pdf", type: "pdf" },
    ];

    const handleStartComparison = () => {
        if (selectedDoc1 && selectedDoc2 && selectedDoc1 !== selectedDoc2) {
            // 여기에 비교 시작 로직 구현
            console.log(`${t("comparisons.startComparison")}: ${selectedDoc1} vs ${selectedDoc2}`);
            // API 호출 로직 추가
        }
    };

    const statusColors = {
        pending: "orange",
        completed: "green",
        failed: "red",
    };

    const statusLabels = {
        pending: t("status.pending"),
        completed: t("status.completed"),
        failed: t("status.failed"),
    };

    const columns = React.useMemo<GridColDef[]>(
        () => [
            {
                field: "id",
                headerName: "ID",
                type: "number",
                minWidth: 50,
            },
            {
                field: "name",
                flex: 1,
                headerName: t("comparisons.name"),
                minWidth: 200,
            },
            {
                field: "document1",
                flex: 1,
                headerName: t("comparisons.document1"),
                minWidth: 150,
            },
            {
                field: "document2",
                flex: 1,
                headerName: t("comparisons.document2"),
                minWidth: 150,
            },
            {
                field: "status",
                flex: 1,
                headerName: t("status.pending"),
                minWidth: 100,
                renderCell: (params) => {
                    return (
                        <Typography
                            color={statusColors[params.value as keyof typeof statusColors]}
                        >
                            {statusLabels[params.value as keyof typeof statusLabels]}
                        </Typography>
                    );
                },
            },
            {
                field: "createdAt",
                flex: 1,
                headerName: t("comparisons.createdAt"),
                minWidth: 150,
                type: "dateTime",
            },
            {
                field: "actions",
                headerName: t("documents.actions"),
                sortable: false,
                renderCell: function render({ row }) {
                    return (
                        <>
                            {row.status === "completed" && (
                                <Button
                                    size="small"
                                    startIcon={<VisibilityIcon />}
                                    onClick={() => window.open(row.resultUrl)}
                                >
                                    {t("comparisons.viewResult")}
                                </Button>
                            )}
                            <ShowButton hideText recordItemId={row.id} />
                            <DeleteButton hideText recordItemId={row.id} />
                        </>
                    );
                },
                align: "center",
                headerAlign: "center",
                minWidth: 200,
            },
        ],
        [t, statusColors, statusLabels]
    );

    return (
        <List>
            <Box mb={3}>
                <Card>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            {t("comparisons.newComparison")}
                        </Typography>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel>{t("comparisons.selectDocument1")}</InputLabel>
                                    <Select
                                        value={selectedDoc1}
                                        onChange={(e) => setSelectedDoc1(e.target.value)}
                                        label={t("comparisons.selectDocument1")}
                                    >
                                        {availableDocuments.map((doc) => (
                                            <MenuItem key={doc.id} value={doc.id}>
                                                {doc.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={1} textAlign="center">
                                <CompareArrowsIcon color="primary" />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel>{t("comparisons.selectDocument2")}</InputLabel>
                                    <Select
                                        value={selectedDoc2}
                                        onChange={(e) => setSelectedDoc2(e.target.value)}
                                        label={t("comparisons.selectDocument2")}
                                    >
                                        {availableDocuments
                                            .filter((doc) => doc.id !== selectedDoc1)
                                            .map((doc) => (
                                                <MenuItem key={doc.id} value={doc.id}>
                                                    {doc.name}
                                                </MenuItem>
                                            ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    startIcon={<CompareArrowsIcon />}
                                    onClick={handleStartComparison}
                                    disabled={!selectedDoc1 || !selectedDoc2}
                                >
                                    {t("comparisons.startComparison")}
                                </Button>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
            
            <Paper>
                <DataGrid {...dataGridProps} columns={columns} autoHeight />
            </Paper>
        </List>
    );
} 