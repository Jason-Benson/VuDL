const path = require("path");
/** @type {import('next').NextConfig} */
module.exports = {
    reactStrictMode: true,
    typescript: {
        // !! WARN !!
        // Dangerously allow production builds to successfully complete even if
        // your project has type errors.
        // !! WARN !!
        ignoreBuildErrors: true,
    },
    turbopack: {
        root: path.join(__dirname, ".."),
    },
};
