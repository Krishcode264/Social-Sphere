/** @type {import('next').NextConfig} */
const nextConfig = {
  serverRuntimeConfig: {
    trustedHosts: ["localhost", "127.0.0.1"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
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
};

export default nextConfig;
