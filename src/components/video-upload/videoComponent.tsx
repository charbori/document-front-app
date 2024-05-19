import { videoStorageEndPoint } from "../../utils/common_var";

const VideoComponent = ({ fileName }) => {
    return (
        <video
            className="max-w-xl max-h-80"
            controls
            preload="metadata"
            aria-label="Video player"
        >
            <source
                src={`${videoStorageEndPoint}/video-manager/${fileName}`}
                type="video/mp4"
            />
        </video>
    );
};

export default VideoComponent;
