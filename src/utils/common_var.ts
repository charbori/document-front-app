const videoApiEndPoint = process.env.NEXT_PUBLIC_VIDEO_API_ENDPOINT;
const videoStorageEndPoint = process.env.NEXT_PUBLIC_VIDEO_STORAGE_ENDPOINT;
const authorizationKey = process.env.NEXT_PUBLIC_AUTHORIZATION_KEY;
const authorizeApiEndPoint = process.env.NEXT_PUBLIC_AUTHORIZATION_API_ENDPOINT;
const loginApiEndPoint = process.env.NEXT_PUBLIC_LOGIN_API_ENDPOINT;
const videoDemoEndPoint = process.env.NEXT_PUBLIC_VIDEO_DEMO_ENDPOINT;
const registerApiEndPoint = process.env.NEXT_PUBLIC_REGISTER_API_ENDPOINT;
const passwordApiEndPoint = process.env.NEXT_PUBLIC_PASSWORD_API_ENDPOINT;
const authProxyServer = process.env.NEXT_PUBLIC_AUTH_PROXY;

export {
    authProxyServer,
    authorizationKey,
    authorizeApiEndPoint,
    loginApiEndPoint,
    passwordApiEndPoint,
    registerApiEndPoint,
    videoApiEndPoint,
    videoDemoEndPoint,
    videoStorageEndPoint,
};
