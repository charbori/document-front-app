"use client";

import { useTranslation } from "@/hooks/useTranslation";
import DownloadIcon from "@mui/icons-material/Download";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
    AppBar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    Toolbar,
    Typography,
} from "@mui/material";
import React, { useState } from "react";
import { DocumentViewer } from "./documentViewer";

interface DocumentComparisonProps {
    document1: {
        id: string;
        name: string;
        url: string;
        type: "pdf" | "image" | "text";
    };
    document2: {
        id: string;
        name: string;
        url: string;
        type: "pdf" | "image" | "text";
    };
    comparisonResult?: {
        differences: Array<{
            type: "added" | "removed" | "modified";
            location: string;
            content: string;
            page?: number;
        }>;
        similarity: number;
        summary: string;
    };
}

export const DocumentComparison: React.FC<DocumentComparisonProps> = ({
    document1,
    document2,
    comparisonResult,
}) => {
    const { t } = useTranslation();
    const [viewMode, setViewMode] = useState<"side-by-side" | "overlay">("side-by-side");
    const [showDifferences, setShowDifferences] = useState(true);

    const handleSwapDocuments = () => {
        // 문서 위치 교체 로직
        console.log(t("comparisons.swapDocuments"));
    };

    const handleDownloadReport = () => {
        // 비교 보고서 다운로드 로직
        console.log(t("comparisons.downloadReport"));
    };

    const getDifferenceColor = (type: "added" | "removed" | "modified") => {
        switch (type) {
            case "added":
                return "success";
            case "removed":
                return "error";
            case "modified":
                return "warning";
            default:
                return "default";
        }
    };

    const getDifferenceLabel = (type: "added" | "removed" | "modified") => {
        switch (type) {
            case "added":
                return t("comparisons.added");
            case "removed":
                return t("comparisons.removed");
            case "modified":
                return t("comparisons.modified");
            default:
                return t("comparisons.modified");
        }
    };

    return (
        <Box>
            <AppBar position="static" color="default" sx={{ mb: 2 }}>
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {t("comparisons.comparisonResult")}: {document1.name} vs {document2.name}
                    </Typography>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setViewMode(viewMode === "side-by-side" ? "overlay" : "side-by-side")}
                        sx={{ mr: 1 }}
                    >
                        {viewMode === "side-by-side" ? t("comparisons.overlay") : t("comparisons.sideBySide")}
                    </Button>
                    <IconButton onClick={handleSwapDocuments} title={t("comparisons.swapDocuments")}>
                        <SwapHorizIcon />
                    </IconButton>
                    <IconButton onClick={handleDownloadReport} title={t("comparisons.downloadReport")}>
                        <DownloadIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>

            <Grid container spacing={2}>
                {/* 비교 결과 요약 */}
                {comparisonResult && (
                    <Grid item xs={12}>
                        <Card sx={{ mb: 2 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {t("comparisons.summary")}
                                </Typography>
                                <Box display="flex" alignItems="center" gap={2} mb={2}>
                                    <Typography variant="body2">
                                        {t("comparisons.similarity")}: {(comparisonResult.similarity * 100).toFixed(1)}%
                                    </Typography>
                                    <Chip
                                        label={`${comparisonResult.differences.length}${t("comparisons.differencesFound")}`}
                                        color="primary"
                                        size="small"
                                    />
                                </Box>
                                <Typography variant="body2" color="textSecondary">
                                    {comparisonResult.summary}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* 문서 뷰어 */}
                <Grid item xs={viewMode === "side-by-side" ? 6 : 12}>
                    <Typography variant="h6" gutterBottom>
                        {t("comparisons.document1")}: {document1.name}
                    </Typography>
                    <DocumentViewer
                        documentUrl={document1.url}
                        documentName={document1.name}
                        documentType={document1.type}
                    />
                </Grid>

                {viewMode === "side-by-side" && (
                    <Grid item xs={6}>
                        <Typography variant="h6" gutterBottom>
                            {t("comparisons.document2")}: {document2.name}
                        </Typography>
                        <DocumentViewer
                            documentUrl={document2.url}
                            documentName={document2.name}
                            documentType={document2.type}
                        />
                    </Grid>
                )}

                {/* 차이점 목록 */}
                {comparisonResult && showDifferences && (
                    <Grid item xs={12}>
                        <Paper sx={{ mt: 2 }}>
                            <Box sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    {t("comparisons.foundDifferences")}
                                </Typography>
                                <List>
                                    {comparisonResult.differences.map((diff, index) => (
                                        <React.Fragment key={index}>
                                            <ListItem>
                                                <ListItemText
                                                    primary={
                                                        <Box display="flex" alignItems="center" gap={1}>
                                                            <Chip
                                                                label={getDifferenceLabel(diff.type)}
                                                                color={getDifferenceColor(diff.type)}
                                                                size="small"
                                                            />
                                                            <Typography variant="body2">
                                                                {diff.location}
                                                                {diff.page && ` (${t("comparisons.page")} ${diff.page})`}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    secondary={diff.content}
                                                />
                                                <IconButton size="small" title={t("actions.view")}>
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </ListItem>
                                            {index < comparisonResult.differences.length - 1 && <Divider />}
                                        </React.Fragment>
                                    ))}
                                </List>
                            </Box>
                        </Paper>
                    </Grid>
                )}
            </Grid>
        </Box>
    );
}; 