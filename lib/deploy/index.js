'use strict';

let _ = require('lodash');
let path = require('path');
let chalk = require('chalk');
let FTPClient = require('ftp');
let Promise = require("bluebird");

const DEPLOY = require('../constants').deploy;
const ENV = require('../constants').env;
const DEFAULT_CONFIG = DEPLOY.config;

let ftp = new FTPClient();

/**
 * @module
 */
module.exports = {
  options: null,
  /**
   * @desc deploy配置API
   * @param {String}-pattern 配置项
   * @param {Object}-options 配置参数
   */
  config: function(options) {
    if (!options || !_.isPlainObject(options)) {
      throw new Error(chalk.red.bold('Invalid deploy configuration,please check your config file'));
    }
    // 若没有区分环境进行配置，则直接使用options对象为配置项
    let _options = options[process.env.BOI_DEPLOY_ENV] || options;
    this.options = _.assign({}, DEFAULT_CONFIG, _options);
  },
  /**
   * @desc 执行部署行为
   */
  run: function() {
    let _this = this;
    let _path = path.parse(_this.options.project.path);
    let _root = _path.root;
    let _tree = _path.dir === _root?null:_path.dir.split(path.sep);

    ftp.on('ready',function(){
      ftp.list(_root,false,()=>{

      })
    });
    // error立即关闭联系并终止进程
    ftp.on('error',function(){
      ftp.destroy();
      process.exit();
    });
    // 建立连接
    ftp.connect(_this.options.connect);
  }
};
