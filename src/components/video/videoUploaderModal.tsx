import { HttpError } from "@refinedev/core";
import { useAutocomplete } from "@refinedev/mui";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import VideoUplaoder from "./videoUploader";

import { UseModalFormReturnType } from "@refinedev/react-hook-form";

import { IPost, IVideoCategory, Nullable } from "../../interfaces/theme";

export const VideoModal: React.FC<
    UseModalFormReturnType<IPost, HttpError, Nullable<IPost>>
> = ({
    saveButtonProps,
    modal: { visible, close, title },
    register,
    control,
    formState: { errors },
}) => {
    const { autocompleteProps } = useAutocomplete<IVideoCategory>({
        resource: "video/category",
    });

    return (
        <Dialog
            open={visible}
            onClose={close}
            PaperProps={{ sx: { minWidth: 500 } }}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <Box
                    component="form"
                    autoComplete="off"
                    sx={{ display: "flex", flexDirection: "column", m: 2 }}
                >
                    <VideoUplaoder />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={close}>close</Button>
            </DialogActions>
        </Dialog>
    );
};
