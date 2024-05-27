"use client";

import { Stack, Typography } from "@mui/material";
import { useShow } from "@refinedev/core";
import {
    DateField,
    NumberField,
    Show,
    TextFieldComponent as TextField,
} from "@refinedev/mui";

export default function BlogPostShow() {
    const { queryResult } = useShow({});

    const { data, isLoading } = queryResult;

    const record = data?.data;

    console.log(record);
    return (
        <Show isLoading={isLoading}>
            <Stack gap={1}>
                <Typography variant="body1" fontWeight="bold">
                    {"ID"}
                </Typography>
                <NumberField value={record?.id ?? ""} />

                <Typography variant="body1" fontWeight="bold">
                    {"Name"}
                </Typography>
                <TextField value={record?.name} />

                <Typography variant="body1" fontWeight="bold">
                    {"description"}
                </Typography>
                <TextField
                    value={record?.description ? record?.description : "-"}
                />

                <Typography variant="body1" fontWeight="bold">
                    {"type"}
                </Typography>
                <TextField
                    value={record?.videoType ? record?.videoType : "-"}
                />

                <Typography variant="body1" fontWeight="bold">
                    {"Status"}
                </Typography>
                <TextField value={record?.status} />

                <Typography variant="body1" fontWeight="bold">
                    {"Created"}
                </Typography>
                <DateField value={record?.createdAt} />

                <Typography variant="body1" fontWeight="bold">
                    {"Updated"}
                </Typography>
                <DateField value={record?.updatedAt} />
            </Stack>
        </Show>
    );
}
