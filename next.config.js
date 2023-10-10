/** @type {import('next').NextConfig} */
const withTM = require("next-transpile-modules")([
    "antd-mobile",
]);
const nextConfig = withTM({
    reactStrictMode: false, /* @note: To prevent duplicated call of useEffect */
    swcMinify: true,

    async rewrites() {
        return [{
            source: "/api/:path*",
            // destination: "http://127.0.0.1:8000/:path*",
            destination: "http://CS-Company-backend-CSes.app.secoder.net/:path*"
        }];
    }
});

module.exports = nextConfig;
