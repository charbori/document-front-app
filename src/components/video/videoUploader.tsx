"use client";

import FileUploadIcon from "@mui/icons-material/FileUpload";
import LoadingButton from "@mui/lab/LoadingButton";
import { ThemeProvider } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DialogContentText from "@mui/material/DialogContentText";
import Stack from "@mui/material/Stack";
import { ChangeEvent, useRef, useState } from "react";
import uuid from "react-uuid";
import TusUploader from "../video-tus-upload/videoTusUploader";

interface uploaderProps {
    files: File;
    uploadIdx: number;
    isUploadLoading: boolean;
    progress: number;
    isSuccess: boolean;
}
const Uploader = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    //const [files, setFiles] = useState<File[]>([]);
    const [uploadFiles, setUploadFiles] = useState<uploaderProps[]>([]);
    const [globalUploadIdx, setGlobalUploadIdx] = useState(1);
    const [globalUploadSign, setGlobalUploadSign] = useState(true);
    const [isUploadLoading, setIsUploadLoading] = useState(false);

    const handleOnSetMultiUploader = async (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        let idx = 1;
        for (const file of Array.from(event.target.files || [])) {
            const uploadFile: uploaderProps = {
                files: file,
                uploadIdx: idx,
                isUploadLoading: false,
                progress: 0,
                isSucces: false,
            };
            setUploadFiles((uploadFiles) => [...uploadFiles, uploadFile]);
            idx++;
            //setFiles((files) => [...files, file]);
        }
    };

    const handleOnSelectFile = () => {
        if (!inputRef.current) {
            return;
        }
        inputRef.current.click();
    };

    function isUploadValidFileType(fileType: any) {
        if (
            fileType.type.substring(0, 5) == "video" ||
            fileType.type.substring(0, 5) == "image"
        ) {
            return true;
        }
        return false;
    }

    function increaseUploadIdx(uploadVal: number) {
        setGlobalUploadIdx(uploadVal + 1);
    }

    function handleOnGlobalUpload() {
        setGlobalUploadSign(!globalUploadSign);
    }

    return (
        <div className="flex flex-col items-center w-full border shadow md:shadow-none md:border-none rounded-xl md:p-6">
            <div className="flex flex-col items-center w-full mt-8 md:flex-row gap-4">
                {/* <BasicButton
                    title="Select an image"
                    styleColor="basic"
                    onClick={handleOnSelectFile}
                /> */}
                <Stack spacing={2} direction="row">
                    <LoadingButton
                        loading={isUploadLoading}
                        loadingPosition="end"
                        endIcon={<FileUploadIcon />}
                        variant="contained"
                        component="span"
                        onClick={handleOnSelectFile}
                    >
                        Upload
                    </LoadingButton>
                    <Button
                        disabled={uploadFiles.length == 0}
                        onClick={handleOnGlobalUpload}
                    >
                        entire upload stop
                    </Button>
                </Stack>
            </div>
            <input
                hidden
                type="file"
                multiple
                onChange={handleOnSetMultiUploader}
                ref={inputRef}
            />
            <DialogContentText sx={{ m: 2 }}>Upload Videos</DialogContentText>
            {uploadFiles.length > 0 ? (
                uploadFiles.map((uploadObj, key) =>
                    isUploadValidFileType(uploadObj.files) ? (
                        <Box sx={{ m: 2 }} key={uuid()}>
                            <TusUploader
                                key={key + 1}
                                uploadIdx={key + 1}
                                targetFile={uploadObj.files}
                                globalUploadIdx={uploadObj.uploadIdx}
                                globalUploadSign={uploadObj.isUploadLoading}
                                isUploadSuccess={uploadObj.isSuccess}
                                uploadProgress={uploadObj.progress}
                                increaseUploadIdx={increaseUploadIdx}
                                uploadObj={uploadObj}
                            />
                        </Box>
                    ) : (
                        ""
                    )
                )
            ) : (
                <ThemeProvider
                    key={uuid()}
                    theme={{
                        palette: {
                            info: {
                                main: "#eeeeee",
                            },
                        },
                    }}
                >
                    {[1, 2, 3, 4, 5].map((element, index) => (
                        <Box
                            key={index}
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
            )}
        </div>
    );
};

export default Uploader;
