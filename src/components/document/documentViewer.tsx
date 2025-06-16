"use client";

import { useTranslation } from "@/hooks/useTranslation";
import DownloadIcon from "@mui/icons-material/Download";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import PrintIcon from "@mui/icons-material/Print";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import {
    AppBar,
    Box,
    Button,
    ButtonGroup,
    IconButton,
    Paper,
    Toolbar,
    Typography,
} from "@mui/material";
import React, { useState } from "react";

interface DocumentViewerProps {
    documentUrl: string;
    documentName: string;
    documentType: "pdf" | "image" | "text";
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
    documentUrl,
    documentName,
    documentType,
}) => {
    const { t } = useTranslation();
    const [zoom, setZoom] = useState(100);
    const [rotation, setRotation] = useState(0);

    const handleZoomIn = () => {
        setZoom((prev) => Math.min(prev + 25, 400));
    };

    const handleZoomOut = () => {
        setZoom((prev) => Math.max(prev - 25, 25));
    };

    const handleRotateLeft = () => {
        setRotation((prev) => prev - 90);
    };

    const handleRotateRight = () => {
        setRotation((prev) => prev + 90);
    };

    const handleFullscreen = () => {
        // 전체화면 구현
        const element = document.getElementById("document-viewer");
        if (element?.requestFullscreen) {
            element.requestFullscreen();
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        const link = document.createElement("a");
        link.href = documentUrl;
        link.download = documentName;
        link.click();
    };

    const renderDocument = () => {
        const style = {
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
            transition: "transform 0.3s ease",
        };

        switch (documentType) {
            case "pdf":
                return (
                    <iframe
                        src={documentUrl}
                        style={{
                            width: "100%",
                            height: "600px",
                            border: "none",
                            ...style,
                        }}
                        title={documentName}
                    />
                );
            case "image":
                return (
                    <img
                        src={documentUrl}
                        alt={documentName}
                        style={{
                            maxWidth: "100%",
                            height: "auto",
                            ...style,
                        }}
                    />
                );
            case "text":
                return (
                    <Box
                        component="pre"
                        sx={{
                            whiteSpace: "pre-wrap",
                            fontFamily: "monospace",
                            padding: 2,
                            backgroundColor: "#f5f5f5",
                            borderRadius: 1,
                            ...style,
                        }}
                    >
                        {t("documents.textContent")}
                    </Box>
                );
            default:
                return (
                    <Typography variant="body1">
                        {t("documents.unsupportedFormat")}
                    </Typography>
                );
        }
    };

    return (
        <Paper elevation={3}>
            <AppBar position="static" color="default">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {documentName}
                    </Typography>
                    <ButtonGroup variant="outlined" size="small">
                        <IconButton 
                            onClick={handleZoomOut} 
                            disabled={zoom <= 25}
                            title={t("viewer.zoomOut")}
                        >
                            <ZoomOutIcon />
                        </IconButton>
                        <Button disabled>{zoom}%</Button>
                        <IconButton 
                            onClick={handleZoomIn} 
                            disabled={zoom >= 400}
                            title={t("viewer.zoomIn")}
                        >
                            <ZoomInIcon />
                        </IconButton>
                    </ButtonGroup>
                    <IconButton onClick={handleRotateLeft} title={t("viewer.rotateLeft")}>
                        <RotateLeftIcon />
                    </IconButton>
                    <IconButton onClick={handleRotateRight} title={t("viewer.rotateRight")}>
                        <RotateRightIcon />
                    </IconButton>
                    <IconButton onClick={handleFullscreen} title={t("viewer.fullscreen")}>
                        <FullscreenIcon />
                    </IconButton>
                    <IconButton onClick={handlePrint} title={t("viewer.print")}>
                        <PrintIcon />
                    </IconButton>
                    <IconButton onClick={handleDownload} title={t("viewer.download")}>
                        <DownloadIcon />
                    </IconButton>
                </Toolbar>
            </AppBar>
            <Box
                id="document-viewer"
                sx={{
                    padding: 2,
                    textAlign: "center",
                    backgroundColor: "#fafafa",
                    minHeight: "600px",
                    overflow: "auto",
                }}
            >
                {renderDocument()}
            </Box>
        </Paper>
    );
}; 