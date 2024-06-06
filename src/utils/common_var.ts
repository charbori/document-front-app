const videoApiEndPoint: string | undefined =
    process.env.NEXT_PUBLIC_VIDEO_API_ENDPOINT;
const videoStorageEndPoint: string | undefined =
    process.env.NEXT_PUBLIC_VIDEO_STORAGE_ENDPOINT;
const authorizationKey: string | undefined =
    process.env.NEXT_PUBLIC_AUTHORIZATION_KEY;
const authorizeApiEndPoint: string | undefined =
    process.env.NEXT_PUBLIC_AUTHORIZATION_API_ENDPOINT;
const loginApiEndPoint: string | undefined =
    process.env.NEXT_PUBLIC_LOGIN_API_ENDPOINT;
const videoUploadEndPoint: string | undefined =
    process.env.NEXT_PUBLIC_VIDEO_DEMO_ENDPOINT;
const registerApiEndPoint: string | undefined =
    process.env.NEXT_PUBLIC_REGISTER_API_ENDPOINT;
const passwordApiEndPoint: string | undefined =
    process.env.NEXT_PUBLIC_PASSWORD_API_ENDPOINT;
const verificationEndPoint: string | undefined =
    process.env.NEXT_PUBLIC_VERIFICATION_API_ENDPOINT;

export {
    authorizationKey,
    authorizeApiEndPoint,
    loginApiEndPoint,
    passwordApiEndPoint,
    registerApiEndPoint,
    verificationEndPoint,
    videoApiEndPoint,
    videoStorageEndPoint,
    videoUploadEndPoint,
};
