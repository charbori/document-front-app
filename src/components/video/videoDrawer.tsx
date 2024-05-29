import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import OpenInFullIcon from "@mui/icons-material/OpenInFull";
import { Button, CardMedia, Stack, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Skeleton from "@mui/material/Skeleton";
import { HttpError, useBack, useGo, useParsed } from "@refinedev/core";
import {
    DateField,
    NumberField,
    Show,
    TextFieldComponent as TextField,
} from "@refinedev/mui";
import { UseModalFormReturnType } from "@refinedev/react-hook-form";
import { IVideo, Nullable } from "../../interfaces/theme";
import { videoStorageEndPoint } from "../../utils/common_var";

const BackButton = () => {
    const goBack = useBack();

    return (
        <Button onClick={goBack}>
            <ArrowBackIcon />
        </Button>
    );
};

const ExpandButton = ({ videoId }) => {
    const goTo = useGo();
    return (
        <Button
            onClick={() => {
                goTo({
                    to: `/video/show/${videoId}`,
                    query: {
                        filters: [],
                    },
                    type: "push",
                });
            }}
        >
            <OpenInFullIcon />
        </Button>
    );
};

export const VideoDrawerShow: React.FC<
    UseModalFormReturnType<IVideo, HttpError, Nullable<IVideo>>
> = ({ refineCore: { queryResult }, modal: { visible, close } }) => {
    const { id } = useParsed();
    const record = queryResult?.data?.data;
    const usernamePath =
        record?.user?.username != undefined
            ? record?.user?.username.split("@")
            : "";

    return (
        <Drawer
            open={visible}
            onClose={close}
            anchor="right"
            PaperProps={{ sx: { width: { sm: "50%", md: 500 } } }}
        >
            <Show
                headerButtons={({ defaultButtons }) => (
                    <>
                        <ExpandButton videoId={record?.id} />
                    </>
                )}
                goBack={<BackButton />}
            >
                <Stack gap={1}>
                    <Box sx={{ maxWidht: "100%", maxHeight: "25%" }}>
                        {record?.name != undefined ? (
                            <CardMedia
                                component="iframe"
                                src={`${videoStorageEndPoint}/video-manager/${usernamePath[0]}/${record?.name}`}
                            ></CardMedia>
                        ) : (
                            <Skeleton variant="rectangular" height={200} />
                        )}
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
        </Drawer>
    );
};
