/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: GitHub Pages serves the contents of out/ as plain files.
  output: 'export',
  // next/image optimisation needs a server; there isn't one on Pages.
  images: { unoptimized: true },
  // Emit about/index.html rather than about.html so Pages resolves /about/.
  trailingSlash: true,
};

export default nextConfig;
