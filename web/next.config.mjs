/** @type {import('next').NextConfig} */
  // next.config.js
const BACKEND_URL =  process.env.NEXT_PUBLIC_SOCKET_SERVER_URL || "http://localhost:8080";


const nextConfig = {




  async rewrites() {
    return [
      // GraphQL endpoint
      {
        source: '/graphql/:path*',
        destination: `${BACKEND_URL}/graphql/:path*`
      },
      // Auth routes
      {
        source: '/auth/:path*',
        destination: `${BACKEND_URL}/auth/:path*`
      },
      // Feed routes
      {
        source: '/api/feed/:path*',
        destination: `${BACKEND_URL}/feed/:path*`
      },
      // Upload routes
      {
        source: '/uploads/:path*',
        destination: `${BACKEND_URL}/uploads/:path*`
      },
      // Post events
      {
        source: '/post-events/:path*',
        destination: `${BACKEND_URL}/post-events/:path*`
      },
      // Message routes
      {
        source: '/message/:path*',
        destination: `${BACKEND_URL}/message/:path*`
      },
      // Health check
      {
        source: '/health',
        destination: `${BACKEND_URL}/health`
      },
      // WebSocket endpoint
      {
        source: '/socket/:path*',
        destination: `${BACKEND_URL}/socket/:path*`
      },
      // Catch-all for any other API routes
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/:path*`
      }
    ];
  },

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
  webpack(config,{isServer}) {
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
     if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
      };
    }

    return config;
   },
};

export default nextConfig;
