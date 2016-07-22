'use strict';

let _ = require('lodash');
let chalk = require('chalk');

let _deploy = require('../constants/deploy.js');

const DEFAULT_CONFIG = _deploy.config;
const API = _deploy.api;

module.exports = {
    options: null,
    /**
     * @desc deploy相关参数配置API
     * @param {String}-pattern 配置项
     * @param {Object}-options 配置参数
     */
    config: function(options){
        if(!options||!_.isPlainObject(options)){
            throw new Error(chalk.red.bold('Invalid deploy configuration,please check your config file'));
        }
        this.options = _.assign({},DEFAULT_CONFIG,options);
    },
    /**
     * @desc 执行部署行为
     */
    run: function(){
        if()
    },
    ftp: function(){
        let FTPClient = require('ftp');
        let ftpClient = new FTPClient();
        const FTP_CONFIG = _deploy.ftp;
    }
};
