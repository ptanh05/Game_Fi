import type { NextConfig } from 'next';
import type { Configuration, RuleSetRule } from 'webpack';

interface ImagesConfig {
  domains: string[];
}

interface ServerRuntimeConfig {
  PROJECT_ROOT: string;
}

interface WebpackOptions {
  isServer: boolean;
}

const nextConfig: NextConfig = {
  images: {
    domains: ["gateway.pinata.cloud"],
  } as ImagesConfig,
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname,
  } as ServerRuntimeConfig,
  webpack: (config: Configuration, { isServer }: WebpackOptions): Configuration => {
    // Bật tính năng async WebAssembly
    config.experiments = { ...config.experiments, asyncWebAssembly: true };

    // Nếu cần, thêm rule cho các file wasm
    const wasmRule: RuleSetRule = {
      test: /\.wasm$/,
      type: "webassembly/async",
    };
    config.module?.rules?.push(wasmRule);

    return config;
  },
};

module.exports = nextConfig;