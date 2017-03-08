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
  path: ''
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
// 'use strict';
//
// const VALID_TYPES = [
//   'ftp',
//   'sftp'
// ];
//
// const DEFAULT_URLPREFIX = '';
//
// const DEFAULT_RECIEVER = {
//   host: '',
//   path: '',
//   port: 21,
//   user: '',
//   password: '',
//   secure: false,
//   secureOptions: null,
//   connTimeout: 10000,
//   pasvTimeout: 10000,
//   keepalive: 10000
// };
//
// module.exports = {
//   types: VALID_TYPES,
//   config: {
//     type: 'ftp',
//     urlPrefix: DEFAULT_URLPREFIX,
//     reciever: DEFAULT_RECIEVER
//   }
// };
