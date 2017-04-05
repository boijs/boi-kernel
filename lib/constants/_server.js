'use strict';

const DEFAULT_CONFIG = {
  domain: 'localhost',
  port: '8888',
  devServerConfig: {
    // display no info to console (only warnings and errors)
    noInfo: false,
    // display nothing to the console
    quiet: false,
    // watch options (only lazy: false)
    watchOptions: {
      aggregateTimeout: 300,
      poll: true
    },
    // custom headers
    headers: {
      'X-Custom-Header': 'yes'
    },
    // options for formating the statistics
    stats: {
      colors: true,
      chunks: false
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
