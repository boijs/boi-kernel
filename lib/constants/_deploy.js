'use strict';

const DEFAULT_CONNECT_CONFIG = {
  host: '',
  port: '',
  user: '',
  password: '',
  secure: false,
  secureOptions: null,
  connTimeout: 10000,
  pasvTimeout: 10000,
  keepalive: 10000
};

const DEFAULT_CDN_CONFIG = {
  domain: '',
  path: '/'
};

module.exports = {
  default: {
    connect: DEFAULT_CONNECT_CONFIG,
    cdn: DEFAULT_CDN_CONFIG,
  },
  // 图片资源可独立配置
  image: {
    connect: DEFAULT_CONNECT_CONFIG,
    cdn: DEFAULT_CDN_CONFIG,
  }
};
