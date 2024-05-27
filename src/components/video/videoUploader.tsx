"use client";

import FileUploadIcon from "@mui/icons-material/FileUpload";
import LoadingButton from "@mui/lab/LoadingButton";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { ChangeEvent, useRef, useState } from "react";
import TusUploader from "../video-tus-upload/videoTusUploader";

const Uploader = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState([]);
    const [globalUploadIdx, setGlobalUploadIdx] = useState(1);
    const [globalUploadSign, setGlobalUploadSign] = useState(true);
    const [isUploadLoading, setIsUploadLoading] = useState(false);

    const handleOnSetMultiUploader = async (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        for (const file of event.target.files) {
            setFiles((files) => [...files, file]);
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

    const onChangeHandler = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        try {
            setIsUploadLoading(true);

            const formData = new FormData();

            const target = event.target;
            const file: File = (target.files as FileList)[0];

            formData.append("file", file);

            const res = await axios.post<{ url: string }>(
                `${apiUrl}/media/upload`,
                formData,
                {
                    withCredentials: false,
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                    },
                }
            );

            const { name, size, type, lastModified } = file;

            const imagePaylod = [
                {
                    name,
                    size,
                    type,
                    lastModified,
                    url: res.data.url,
                },
            ];

            setValue("images", imagePaylod, { shouldValidate: true });

            setIsUploadLoading(false);
        } catch (error) {
            setError("images", { message: "Upload failed. Please try again." });
            setIsUploadLoading(false);
        }
    };

    function increaseUploadIdx(uploadVal: number) {
        setGlobalUploadIdx(uploadVal + 1);
    }

    function handleOnGlobalUpload() {
        setGlobalUploadSign(!globalUploadSign);
    }

    return (
        <div
            key={globalUploadIdx}
            className="flex flex-col items-center w-full border shadow md:shadow-none md:border-none rounded-xl md:p-6"
        >
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
                        disabled={files.length == 0}
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
            {files.map((fileVal, key) =>
                isUploadValidFileType(fileVal) ? (
                    <Box sx={{ m: 2 }}>
                        <TusUploader
                            key={key + 1}
                            uploadIdx={key + 1}
                            targetFile={fileVal}
                            globalUploadIdx={globalUploadIdx}
                            globalUploadSign={globalUploadSign}
                            increaseUploadIdx={increaseUploadIdx}
                        />
                    </Box>
                ) : (
                    ""
                )
            )}
        </div>
    );
};

export default Uploader;
