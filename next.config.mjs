/** @type {import('next').NextConfig} */
const nextConfig = {
    api: {
      bodyParser: false, // Disable Next.js body parsing if using custom middleware
      externalResolver: true, // Prevent Next.js from enforcing its own timeouts
    },
  };
  
  export default nextConfig;
  