/** @type {import('next').NextConfig} */
const nextConfig = {
  serverRuntimeConfig: {
    trustedHosts: ["localhost", "127.0.0.1"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com/a",
      },
      {
        protocol: "https",
        hostname: "cdn.pixabay.com",
      },
      {
        protocol: "https",
        hostname: "krish-b264.s3.ap-south-1.amazonaws.com/*",
      },
      {
        protocol: "https",
        hostname: "krish-b264.s3.ap-south-1.amazonaws.com",
      },
    ],
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.(mp3|wav|ogg|flac)$/,
      use: {
        loader: "file-loader",
        options: {
          name: "[name].[ext]",
          outputPath: "static/sounds/",
          publicPath: "/_next/static/sounds/",
        },
      },
    });

    return config;
   },
};

export default nextConfig;
