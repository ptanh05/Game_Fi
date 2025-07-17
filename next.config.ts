module.exports = {
  images: {
    domains: ["gateway.pinata.cloud"],
  },
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname,
  },
  webpack: (config, { isServer }) => {
    // Bật tính năng async WebAssembly
    config.experiments = { ...config.experiments, asyncWebAssembly: true };

    // Nếu cần, thêm rule cho các file wasm
    config.module.rules.push({
      test: /\.wasm$/,
      type: "webassembly/async",
    });

    return config;
  },
};