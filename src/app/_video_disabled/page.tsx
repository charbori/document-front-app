"use client";

import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import {
    DataGrid,
    GridColDef,
    GridToolbar,
    getGridDateOperators,
    getGridNumericOperators,
    getGridStringOperators,
} from "@mui/x-data-grid";
import { HttpError, useMany } from "@refinedev/core";
import {
    DateField,
    DeleteButton,
    List,
    MarkdownField,
    ShowButton,
    useDataGrid,
} from "@refinedev/mui";
import { useModalForm } from "@refinedev/react-hook-form";
import Cookies from "js-cookie";

import React from "react";
import { VideoModal } from "../../components/video/videoUploaderModal";

import { VideoDrawerShow } from "../../components/video/videoDrawer";
import { IVideo, Nullable } from "../../interfaces/theme";
export const getUtcDateIgnoreTz = (value: any) => {
    const localDate = new Date(value.row.createdAt);
    return localDate;
};
export default function BlogPostList() {
    const [loading, setLoading] = React.useState(true);
    const { dataGridProps } = useDataGrid({
        syncWithLocation: true,
    });
    const createModalFormProps = useModalForm<
        IVideo,
        HttpError,
        Nullable<IVideo>
    >({
        refineCoreProps: { action: "create" },
        syncWithLocation: true,
    });

    const {
        modal: { show: showCreateModal },
    } = createModalFormProps;

    const editModalFormProps = useModalForm<IVideo>({
        refineCoreProps: { action: "edit" },
        syncWithLocation: true,
    });

    const showDrawerFormProps = useModalForm<
        IVideo,
        HttpError,
        Nullable<IVideo>
    >({
        refineCoreProps: {
            action: "edit",
        },
        syncWithLocation: true,
    });

    const {
        modal: { show: showCreateDrawer },
    } = showDrawerFormProps;

    const {
        modal: { show: showEditModal },
    } = editModalFormProps;

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
                message: `Something went wrong when getting ${data}`,
                description: "Error",
                type: "error",
            };
        },
    });

    const modal_event_field_arr = ["id", "name", "description"];
    const handleRowClick: any = (params: any) => {
        if (modal_event_field_arr.includes(params.field)) {
            showCreateDrawer(params.id);
        }
    };

    const columns = React.useMemo<GridColDef[]>(
        () => [
            {
                field: "id",
                headerName: "ID",
                type: "number",
                minWidth: 50,
                filterOperators: getGridNumericOperators().filter(
                    (operator) => operator.value === "="
                ),
            },
            {
                field: "name",
                flex: 1,
                headerName: "name",
                type: "string",
                minWidth: 200,
                filterOperators: getGridStringOperators().filter(
                    (operator) =>
                        operator.value === "contains" ||
                        //operator.value === "startsWith" ||
                        //operator.value === "endsWith" ||
                        operator.value === "equals"
                ),
            },
            {
                field: "description",
                flex: 1,
                headerName: "description",
                type: "string",
                minWidth: 250,
                renderCell: function render({ value }) {
                    if (!value) return "-";
                    return (
                        <MarkdownField
                            value={value?.slice(0, 80) + "..." || ""}
                        />
                    );
                },
                filterOperators: getGridStringOperators().filter(
                    (operator) =>
                        operator.value === "contains" ||
                        //operator.value === "startsWith" ||
                        //operator.value === "endsWith" ||
                        operator.value === "equals"
                ),
            },
            {
                field: "createdAt",
                flex: 1,
                type: "dateTime",
                headerName: "Created at",
                minWidth: 250,
                valueGetter: (params) => getUtcDateIgnoreTz(params),
                renderCell: function render({ value }) {
                    return <DateField value={value} />;
                },
                filterOperators: getGridDateOperators().filter(
                    (operator) =>
                        //operator.value === "after" ||
                        //operator.value === "before" ||
                        operator.value === "is"
                ),
            },
            {
                field: "actions",
                headerName: "Actions",
                sortable: false,
                renderCell: function render({ row }) {
                    return (
                        <>
                            {/* <EditButton hideText recordItemId={row.id} /> */}
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
        []
    );

    return (
        <>
            <List createButtonProps={{ onClick: () => showCreateModal() }}>
                {dataGridProps?.loading == true ? (
                    <>
                        <Typography component="div" variant="h1">
                            <Skeleton />
                        </Typography>
                        <Typography component="div" variant="h3">
                            <Skeleton />
                            <Skeleton animation="wave" />
                            <Skeleton animation={false} />
                            <Skeleton />
                            <Skeleton animation="wave" />
                            <Skeleton animation={false} />
                        </Typography>
                    </>
                ) : (
                    <DataGrid
                        {...dataGridProps}
                        columns={columns}
                        autoHeight
                        onCellClick={handleRowClick}
                        slots={{ toolbar: GridToolbar }}
                    />
                )}
            </List>
            <VideoModal {...createModalFormProps} />
            <VideoDrawerShow {...showDrawerFormProps} />
        </>
    );
}
