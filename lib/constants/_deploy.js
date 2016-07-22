'use strict';

const DEFAULT_FTP_CONFIG = {
    host: '',
    port: 21,
    path: '/',
    user: '',
    password: '',
    secure: false,
    secureOptions: null,
    connTimeout: 10000,
    pasvTimeout: 10000,
    keepalive: 10000
};

const API = {
    getVersion: ''
};

const DEFAULT_DEPLOY_CONFIG = {
    type: 'ftp'
};

module.exports = {
    config: DEFAULT_DEPLOY_CONFIG,
    api: API,
    ftp: DEFAULT_FTP_CONFIG
};
