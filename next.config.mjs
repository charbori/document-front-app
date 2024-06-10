/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: false,
    typescript: {
        ignoreBuildErrors: true,
    },
    async headers() {
        return [
            {
                source: "/:path*",
                headers: [
                    { key: "Access-Control-Allow-Credentials", value: "true" },
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    {
                        key: "Access-Control-Allow-Methods",
                        value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
                    },
                    {
                        key: "Access-Control-Allow-Headers",
                        value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
                    },
                ],
            },
        ];
    },
    async rewrites() {
        return [
            {
                source: "/video-storage/:path*",
                destination: "http://content1.couhensoft.com:9000/:path*",
            },
            {
                source: "/:path*",
                destination: "https://api.couhensoft.com/:path*",
            },
        ];
    },
};

export default nextConfig;
