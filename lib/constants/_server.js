'use strict';

const DEFAULT_CONFIG = {
  domain: 'localhost',
  port: '8888',
  devServerConfig: {
    // noInfo: true,
    // quiet: true,
    clientLogLevel: 'info',
    // 不启用压缩
    compress: false,
    // enable hmr
    hot: true,
    hotOnly: true,
    // no lazy mode
    lazy: false,
    watchOptions: {
      ignored: /node_modules/,
      aggregateTimeout: 300,
      poll: false
    },
    overlay: {
      warnings: false,
      error: true
    },
    // options for formating the statistics
    stats: {
      children: false,
      errors: true,
      colors: true,
      chunks: false,
      chunkModules:false
    }
  }
};

const DEFAULT_MOCK = {
  // 是否开启mock
  enable: false,
  // mock配置文件
  configFile: ''
};

module.exports = {
  config: DEFAULT_CONFIG,
  mock: DEFAULT_MOCK
};
