'use strict';

const CONNECT_CONFIG_LIST = {
  sftp: {
    host: '',
    port: '',
    path: ''
  },
  ftp: {
    host: '',
    port: '',
    path: '',
    user: '',
    password: '',
    secure: false,
    secureOptions: null,
    connTimeout: 10000,
    pasvTimeout: 10000,
    keepalive: 10000
  },
  ssh: {
    host: '',
    port: '',
    path: ''
  }
};

module.exports = {
  connect_config_list: CONNECT_CONFIG_LIST
};
