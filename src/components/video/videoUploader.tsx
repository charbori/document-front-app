"use client";

import FileUploadIcon from "@mui/icons-material/FileUpload";
import LoadingButton from "@mui/lab/LoadingButton";
import { ThemeProvider } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import DialogContentText from "@mui/material/DialogContentText";
import Stack from "@mui/material/Stack";
import axios from "axios";
import Cookies from "js-cookie";
import { ChangeEvent, useRef, useState } from "react";
import uuid from "react-uuid";
import { videoApiEndPoint } from "../../utils/common_var";
import TusUploader from "../video-tus-upload/videoTusUploader";

interface uploaderProps {
    files: File;
    uploadIdx: number;
    isUploadLoading: boolean;
    progress: number;
    isSuccess: boolean;
}

interface uploadValidProps {
    isFileExist: boolean;
    file: File;
}

const Uploader = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    //const [files, setFiles] = useState<File[]>([]);
    const [uploadFiles, setUploadFiles] = useState<uploaderProps[]>([]);
    const [uploadIdx, setUploadIdx] = useState(1);
    const [globalUploadIdx, setGlobalUploadIdx] = useState(1);
    const [globalUploadSign, setGlobalUploadSign] = useState(true);
    const [isUploadLoading, setIsUploadLoading] = useState(false);
    const cookieData = Cookies.get("auth");
    const [fileUploadExist, setFileUploadExist] = useState(false);

    // onclick event
    const handleOnSetMultiUploader = async (
        event: ChangeEvent<HTMLInputElement>
    ) => {
        for (const file of Array.from(event.target.files || [])) {
            getContentUpload(file);
        }
    };

    // server model validation
    const getContentUpload = async (file: File) => {
        const response = await axios
            .get(videoApiEndPoint + `/video/validation/${file.name}`, {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${cookieData}`,
                },
            })
            .then(function (response) {
                let newFile: File;
                if (response.data.data != "") {
                    newFile = makeNewFile(file, response.data.data);
                } else {
                    newFile = file;
                }
                const validationData: uploadValidProps = {
                    isFileExist: response.data.data == "" ? false : true,
                    file: newFile,
                };

                setFileUpload(validationData);
            })
            .catch(function (error) {
                console.error("REGIST VIDEO FAIL", error);
                return false;
            });

        return response;
    };

    // server make model
    const registContentUpload = async (
        contentStatus: string,
        targetFile: File
    ) => {
        if (contentStatus == "WAIT") {
            const response = await axios
                .post(
                    videoApiEndPoint ?? "",
                    {
                        name: targetFile.name,
                        description: "",
                        tag: "1.0",
                        status: contentStatus,
                        videoType: targetFile.type,
                        role: "ROLE_ADMIN",
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${cookieData}`,
                        },
                    }
                )
                .catch(function (error) {
                    console.error("REGIST VIDEO FAIL", error);
                });
        } else {
            const response = await axios
                .patch(
                    videoApiEndPoint + "/status",
                    {
                        name: targetFile.name,
                        status: contentStatus,
                    },
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${cookieData}`,
                        },
                    }
                )
                .catch(function (error) {
                    console.error("UPDATE STATUS VIDEO FAIL", error);
                });
        }
        return true;
    };

    // client make view
    const setFileUpload = ({ isFileExist, file }: uploadValidProps) => {
        const uploadFile: uploaderProps = {
            files: file,
            uploadIdx: uploadIdx,
            isUploadLoading: false,
            progress: 0,
            isSuccess: false,
        };
        if (uploadIdx == 1) {
            uploadFile.isUploadLoading = true;
        }
        if (isFileExist) {
            if (confirm("Do you want re-upload same name file")) {
                registContentUpload("WAIT", file);
                setUploadFiles((uploadFiles) => [...uploadFiles, uploadFile]);
                setUploadIdx(uploadIdx + 1);
            } else {
                return;
            }
        } else {
            registContentUpload("WAIT", file);
            setUploadFiles((uploadFiles) => [...uploadFiles, uploadFile]);
            setUploadIdx(uploadIdx + 1);
        }
    };

    const makeNewFile = (oldFile: File, newFileName: string) => {
        let newFile: File;
        const fileType: string = oldFile.name.split(".")[1].toLowerCase();
        switch (fileType) {
            case "jpg": //jpg일 경우
            case "png":
            case "mp4":
                newFile = new File([oldFile], `${newFileName}`, {
                    type: oldFile.type,
                });
                break;
            default:
                alert("지원하지 않는 파일 형식입니다.");
                return oldFile;
                break;
        }
        return newFile;
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
