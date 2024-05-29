import { HttpError } from "@refinedev/core";
import { useAutocomplete } from "@refinedev/mui";

import { Box, ThemeProvider } from "@mui/material";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
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
                <ThemeProvider
                    theme={{
                        palette: {
                            info: {
                                main: "#eeeeee",
                            },
                        },
                    }}
                >
                    <DialogContentText>Upload Videos</DialogContentText>
                    {[1, 2, 3, 4, 5].map((element, index) => (
                        <Box
                            sx={{
                                borderRadius: 1,
                                bgcolor: "info.main",
                                maxWidth: "100%",
                                height: 30,
                                m: 1,
                            }}
                        ></Box>
                    ))}
                </ThemeProvider>
            </DialogContent>
            <DialogActions>
                <Button onClick={close}>close</Button>
            </DialogActions>
        </Dialog>
    );
};
