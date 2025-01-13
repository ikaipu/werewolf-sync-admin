let userConfig = undefined;
try {
  userConfig = await import("./v0-user-next.config");
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  output: "export",
};

function mergeConfig(baseConfig, userConfig) {
  if (!userConfig) {
    return baseConfig;
  }

  const mergedConfig = { ...baseConfig };
  for (const key in userConfig) {
    if (
      typeof baseConfig[key] === "object" &&
      !Array.isArray(baseConfig[key])
    ) {
      mergedConfig[key] = {
        ...baseConfig[key],
        ...userConfig[key],
      };
    } else {
      mergedConfig[key] = userConfig[key];
    }
  }
  return mergedConfig;
}

export default mergeConfig(nextConfig, userConfig?.default);
