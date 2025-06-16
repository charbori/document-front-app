"use client";

import { useTranslation } from "@/hooks/useTranslation";
import { AppIcon } from "@components/app-icon";
import { Box, Button } from "@mui/material";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import { AuthPage as AuthPageBase, ThemedTitleV2 } from "@refinedev/mui";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { verificationEndPoint } from "../../utils/common_var";

export default function Verification() {
    const { t } = useTranslation();
    const verificationUrl = verificationEndPoint;
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [modalType, setModalType] = useState("success");

    const verificationQuery = useSearchParams();
    const verificationUser = () => {
        if (verificationQuery?.get("verificationCode") === null) {
            setModalType("fail");
            handleClickOpen();
        }
        const response = axios
            .get(
                verificationUrl +
                    "?verificationCode=" +
                    verificationQuery?.get("verificationCode"),
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
            .then(function (response) {
                handleClickOpen();
            })
            .catch(function (error) {
                setModalType("fail");
                handleClickOpen();
            });
    };
    const handleClickOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
        router.push("/login");
    };

    return (
        <>
            <AuthPageBase
                hideForm={true}
                registerLink={
                    <Box
                        display="flex"
                        justifyContent="flex-end"
                        alignItems="center"
                        sx={{
                            mt: "24px",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Button
                            variant="outlined"
                            onClick={() => verificationUser()}
                        >
                            {t("auth.verification")}
                        </Button>
                    </Box>
                }
                title={
                    <ThemedTitleV2
                        collapsed={false}
                        text={t("meta.title")}
                        icon={<AppIcon />}
                    />
                }
            />
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {modalType == "fail"
                        ? t("auth.verificationFailed")
                        : t("auth.verificationSuccess")}
                </DialogTitle>
                <DialogActions>
                    {modalType == "fail" ? (
                        <Button onClick={handleClose}>{t("auth.findUser")}</Button>
                    ) : (
                        <Button onClick={handleClose}>{t("auth.login")}</Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
}
