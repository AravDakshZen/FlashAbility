import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: build produces an `out/` folder of HTML/CSS/JS that can be
  // served from any static web server (including a bare ESP32 web loader).
  output: "export",
  images: {
    // Static export cannot use the default image optimizer. Emit plain <img>
    // so /images/* and data: URIs keep working on a static host.
    unoptimized: true,
  },
};

export default nextConfig;
