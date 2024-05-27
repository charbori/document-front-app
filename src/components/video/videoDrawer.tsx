import { Stack, Typography } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import { HttpError, useParsed } from "@refinedev/core";
import {
    DateField,
    NumberField,
    Show,
    TextFieldComponent as TextField,
} from "@refinedev/mui";
import { UseModalFormReturnType } from "@refinedev/react-hook-form";
import { IVideo, Nullable } from "../../interfaces/theme";

export const VideoDrawerShow: React.FC<
    UseModalFormReturnType<IVideo, HttpError, Nullable<IVideo>>
> = ({
    saveButtonProps,
    refineCore: { queryResult },
    modal: { show, visible, close },
    register,
    control,
    formState: { errors },
}) => {
    const { id } = useParsed();
    const record = queryResult?.data?.data;

    return (
        <Drawer
            open={visible}
            onClose={close}
            anchor="right"
            PaperProps={{ sx: { width: { sm: "50%", md: 500 } } }}
        >
            <Show>
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
        </Drawer>
    );
};
