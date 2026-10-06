/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@lk/database"],
  images: {
    unoptimized: true, // No external image servers required
  },
};

export default nextConfig;
