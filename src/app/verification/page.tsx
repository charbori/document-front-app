"use client";

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
                            Verification
                        </Button>
                    </Box>
                }
                title={
                    <ThemedTitleV2
                        collapsed={false}
                        text="kvi Video Manager"
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
                        ? `회원 검증에 실패하였습니다.
                        비밀번호 찾기를 통해 다시 확인해주세요.`
                        : `회원 검증에 성공하였습니다.
                        로그인을 해주세요.`}
                </DialogTitle>
                <DialogActions>
                    {modalType == "fail" ? (
                        <Button onClick={handleClose}>Find User</Button>
                    ) : (
                        <Button onClick={handleClose}>Login</Button>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
}
