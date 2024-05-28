"use client";

import { CardMedia, Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import { useShow } from "@refinedev/core";
import {
    DateField,
    NumberField,
    Show,
    TextFieldComponent as TextField,
} from "@refinedev/mui";
import { videoStorageEndPoint } from "../../../../utils/common_var";

export default function BlogPostShow() {
    const { queryResult } = useShow({});
    const { data, isLoading } = queryResult;
    const record = data?.data;
    const usernamePath =
        record?.user?.username != undefined
            ? record?.user?.username.split("@")
            : "";

    //todo <Box> video skeleton or loading
    return (
        <Show isLoading={isLoading}>
            <Stack gap={1}>
                <Box sx={{ maxWidht: "100%", maxHeight: "100%" }}>
                    <CardMedia
                        component="iframe"
                        sx={{
                            maxWidht: "100%",
                            maxHeight: "100%",
                            minHeight: 300,
                        }}
                        src={`${videoStorageEndPoint}/video-manager/${usernamePath[0]}/${record?.name}`}
                    ></CardMedia>
                </Box>
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
