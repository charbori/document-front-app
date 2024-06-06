"use client";

import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import InsertPhotoIcon from "@mui/icons-material/InsertPhoto";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VideoFileIcon from "@mui/icons-material/VideoFile";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import axios from "axios";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import type { PreviousUpload, Upload } from "tus-js-client";
import { useTus } from "use-tus";
import { videoApiEndPoint, videoUploadEndPoint } from "../../utils/common_var";

interface TusUploaderProps {
    uploadIdx: number;
    targetFile: File;
    globalUploadIdx: number;
    globalUploadSign: boolean;
    increaseUploadIdx(uploadVal: number): void;
}

const TusUploader: React.FC<TusUploaderProps> = ({
    uploadIdx,
    targetFile,
    globalUploadIdx,
    globalUploadSign,
    increaseUploadIdx,
}) => {
    const { upload, setUpload, isSuccess, isAborted, isUploading, remove } =
        useTus({
            autoStart: false,
        });

    const [progress, setProgress] = useState(0);
    const [uploadedUrl, setUploadedUrl] = useState("");

    const [fileType, setFileType] = useState("photo");
    const [fileName, setFileName] = useState("");

    const [uploadStart, setUploadStart] = useState(0);
    const cookieData = Cookies.get("auth");

    function askToResumeUpload(
        previousUploads: PreviousUpload[],
        currentUpload: Upload
    ) {
        if (previousUploads.length === 0) return;

        let text =
            "You tried to upload this file previously at these times:\n\n";
        previousUploads.forEach((previousUpload, index) => {
            text += `[${index}] ${previousUpload.creationTime}\n`;
        });
        text +=
            "\nEnter the corresponding number to resume an upload or press Cancel to start a new upload";

        const answer: string | null = prompt(text);
        const index = Number(answer);

        if (!Number.isNaN(index) && previousUploads[index]) {
            currentUpload.resumeFromPreviousUpload(previousUploads[index]);
        }
    }

    const registContentUpload = async (contentStatus: string) => {
        console.log(contentStatus + " " + cookieData);

        try {
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
                    .then(function (response) {
                        console.log(response);
                    })
                    .catch(function (error) {
                        console.log(error);
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
                    .then(function (response) {
                        console.log(response);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }
        } catch (error) {
            console.error("regist metadata fail", error);
        }
    };

    useEffect(() => {
        if (globalUploadSign && globalUploadIdx == uploadIdx) {
            if (!isAborted) {
                startUploading();
            } else {
                increaseUploadIdx(uploadIdx);
            }
        }
        if (globalUploadSign === false && upload) {
            upload.abort();
        }
    }, [upload, globalUploadIdx, globalUploadSign]);

    function startUploading() {
        if (upload) {
            upload.findPreviousUploads().then((previousUploads) => {
                askToResumeUpload(previousUploads, upload);
                upload.start();
            });
        }
    }

    useEffect(() => {
        const file = targetFile;

        if (!file) {
            return;
        }

        if (progress == 0 && uploadStart == 0) {
            setUploadStart(1);
            registContentUpload("WAIT");
        }
        setFileName(file.name);

        setUpload(file, {
            endpoint: videoUploadEndPoint,
            chunkSize: file.size / 10,
            metadata: {
                filename: file.name,
                filetype: file.type,
            },
            headers: {
                Authorization: `Bearer ${cookieData}`,
                fileKey: file.name,
            },
            onProgress: (bytesSent, bytesTotal) => {
                setProgress(
                    Number(((bytesSent / bytesTotal) * 100).toFixed(2))
                );
            },
            onSuccess: (upload) => {
                if (file.type.substring(0, 5) == "image") {
                    setUploadedUrl(
                        videoUploadEndPoint +
                            "/" +
                            encodeURIComponent(file.name)
                    );
                    setFileType("photo");
                } else if (file.type.substring(0, 5) == "video") {
                    setUploadedUrl(file.name);
                    setFileType("video");
                    // @ts-ignore
                    localStorage.removeItem(upload._urlStorageKey);
                } else {
                    setFileType("");
                }
                increaseUploadIdx(uploadIdx);
            },
        });
    }, [targetFile]);

    const handleOnStart = async () => {
        if (!upload) {
            return;
        }
        registContentUpload("UPLOADING");

        upload.start();
    };

    const handleOnAbort = async () => {
        if (!upload) {
            return;
        }
        registContentUpload("STOP");

        await upload.abort();
        increaseUploadIdx(uploadIdx);
    };

    const handleOnRemove = async () => {
        if (!upload) {
            return;
        }

        try {
            const response = await axios
                // @ts-ignore
                .delete(upload._req._url, {
                    headers: {
                        Authorization: `Bearer ${cookieData}`,
                        "Content-Type": "application/json",
                    },
                    data: {
                        name: targetFile.name,
                    },
                })
                .then(function (response) {
                    console.log(response);
                })
                .catch(function (error) {
                    console.log(error);
                });
        } catch (error) {
            console.error("remove video fail", error);
        }
        // @ts-ignore
        localStorage.removeItem(upload._urlStorageKey);
        remove();
    };

    return (
        <div
            key={uploadIdx}
            className="flex flex-col items-center w-full border shadow md:shadow-none md:border-none rounded-xl md:p-6"
        >
            <Stack spacing={4} direction="row">
                {uploadedUrl && fileType == "photo" && (
                    // <div className="max-w-md max-h-fit flex md:flex-col items-center flex-1 mt-8">
                    //     <img src={uploadedUrl} alt="upload" />
                    // </div>
                    <InsertPhotoIcon color="primary"></InsertPhotoIcon>
                )}
                {uploadedUrl && fileType == "video" && (
                    // <div className="max-w-md max-h-fit flex md:flex-col items-center flex-1 mt-8">
                    //     <VideoComponent fileName={uploadedUrl} />
                    // </div>
                    <VideoFileIcon color="primary"></VideoFileIcon>
                )}
                <span>{fileName}</span>
                {!isUploading && !isSuccess && (
                    //disabled={isSuccess || !isAborted}
                    <PlayArrowIcon onClick={handleOnStart}></PlayArrowIcon>
                )}
                {isUploading && progress < 100 && (
                    <CircularProgress
                        color="primary"
                        size="20"
                        variant="determinate"
                        value={progress}
                    />
                )}
                {progress < 100 && (
                    <PauseIcon onClick={handleOnAbort}></PauseIcon>
                )}
                {(progress == 100 || isSuccess) && (
                    <>
                        <CheckCircleOutlineIcon color="success" />
                        <DeleteIcon
                            color="error"
                            onClick={handleOnRemove}
                        ></DeleteIcon>
                    </>
                )}
                {/* disabled={!isUploading} */}
            </Stack>
        </div>
    );
};

export default TusUploader;
