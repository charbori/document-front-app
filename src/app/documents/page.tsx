"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { HttpError } from "@refinedev/core";
import {
    DeleteButton,
    EditButton,
    List,
    ShowButton,
    useDataGrid,
} from "@refinedev/mui";
import { useModalForm } from "@refinedev/react-hook-form";
import React from "react";

interface IDocument {
    id: string;
    name: string;
    type: string;
    size: number;
    uploadedAt: string;
    category: string;
}

export default function DocumentList() {
    const { t } = useTranslation();
    const { dataGridProps } = useDataGrid<IDocument>();
    
    const createModalFormProps = useModalForm<
        IDocument,
        HttpError,
        IDocument
    >({
        refineCoreProps: { action: "create" },
    });

    const editModalFormProps = useModalForm<IDocument>({
        refineCoreProps: { action: "edit" },
    });

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
                headerName: t("documents.name"),
                minWidth: 200,
            },
            {
                field: "type",
                flex: 1,
                headerName: t("documents.type"),
                minWidth: 100,
            },
            {
                field: "size",
                flex: 1,
                headerName: t("documents.size"),
                minWidth: 100,
                valueFormatter: (params) => {
                    const sizeInMB = (params.value / (1024 * 1024)).toFixed(2);
                    return `${sizeInMB} MB`;
                },
            },
            {
                field: "category",
                flex: 1,
                headerName: t("documents.category"),
                minWidth: 150,
            },
            {
                field: "uploadedAt",
                flex: 1,
                headerName: t("documents.uploadedAt"),
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
                            <EditButton hideText recordItemId={row.id} />
                            <ShowButton hideText recordItemId={row.id} />
                            <DeleteButton hideText recordItemId={row.id} />
                        </>
                    );
                },
                align: "center",
                headerAlign: "center",
                minWidth: 80,
            },
        ],
        [t]
    );

    return (
        <List>
            <DataGrid {...dataGridProps} columns={columns} autoHeight />
        </List>
    );
} 