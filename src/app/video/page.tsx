"use client";

import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useMany } from "@refinedev/core";
import {
    DateField,
    DeleteButton,
    EditButton,
    List,
    MarkdownField,
    ShowButton,
    useDataGrid,
} from "@refinedev/mui";
import Cookies from "js-cookie";

import React from "react";

export default function BlogPostList() {
    const { dataGridProps } = useDataGrid({
        syncWithLocation: true,
    });

    const { data: categoryData, isLoading: categoryIsLoading } = useMany({
        resource: "video",
        ids:
            dataGridProps?.rows
                ?.map((item: any) => item?.category?.id)
                .filter(Boolean) ?? [],
        queryOptions: {
            retry: 3,
            enabled: false,
            retryDelay: 1000,
        },
        meta: {
            headers: {
                Authorization: "Bearer " + Cookies.get("auth"),
            },
        },
        successNotification: (data, ids, resource) => {
            return {
                message: `Successfully fetched.`,
                description: "Success with no errors",
                type: "success",
            };
        },
        errorNotification: (data, ids, resource) => {
            return {
                message: `Something went wrong when getting ${data.id}`,
                description: "Error",
                type: "error",
            };
        },
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
                headerName: "name",
                minWidth: 200,
            },
            {
                field: "description",
                flex: 1,
                headerName: "description",
                minWidth: 250,
                renderCell: function render({ value }) {
                    if (!value) return "-";
                    return (
                        <MarkdownField
                            value={value?.slice(0, 80) + "..." || ""}
                        />
                    );
                },
            },
            {
                field: "status",
                flex: 1,
                headerName: "Status",
                minWidth: 200,
            },
            {
                field: "createdAt",
                flex: 1,
                headerName: "Created at",
                minWidth: 250,
                renderCell: function render({ value }) {
                    return <DateField value={value} />;
                },
            },
            {
                field: "actions",
                headerName: "Actions",
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
        [categoryData]
    );

    return (
        <List>
            <DataGrid {...dataGridProps} columns={columns} autoHeight />
        </List>
    );
}
