/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["bcryptjs"],
  },
  images: {
    remotePatterns: [
      {
        protocol: process.env.NODE_ENV === "production" ? "https" : "http",
        hostname:
          process.env.NEXT_PUBLIC_STRAPI_API_URL?.replace(/^https?:\/\//, "") ||
          "localhost",
        port: process.env.NODE_ENV === "production" ? "" : "1337",
        pathname: "/uploads/**",
      },
    ],
  },
};

module.exports = nextConfig;
