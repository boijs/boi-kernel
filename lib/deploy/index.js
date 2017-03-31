'use strict';

let _ = require('lodash');
let path = require('path');
let chalk = require('chalk');
let glob = require('glob');
let FTPClient = require('ftp');
let utils = require('../utils');
let config = require('../config');


const DEPLOY_CONFIG = require('../constants').deploy;
const ENV = require('../constants').env;

let mergeMap = utils.mergeMap;
let Log = utils.log;
let ftp = new FTPClient();

function uploadFiles(ftp, srcDir, targetPath) {
  let _srcFiles = path.posix.join(process.cwd(),srcDir, '**/*.*');
  let _srcPath = path.posix.join(process.cwd(),srcDir,'/');
  let _targetPath = path.posix.join('/',targetPath,'/');

  let fileSum = 0;
  let fileUploaded = 0;
  glob(_srcFiles, (err, files) => {
    if (err) {
      Log.error(err);
      ftp.destroy();
      process.exit();
    }
    if (!files || files.length === 0) {
      Log.error('No files found in ' + srcDir);
      ftp.destroy();
      process.exit();
    }
    fileSum = files.length;
    files.forEach(function(file) {
      Log.info('Uploading ' + file + '...');
      let _target = file.replace(_srcPath,_targetPath);
      ftp.put(file, _target, false, (err) => {
        if (err) {
          Log.error(err);
          ftp.destroy();
          process.exit();
        }
        Log.info(file + ' has been uploaded');
        fileUploaded++;
        if(fileUploaded>= fileSum){
          Log.info('All files\' been uploaded');
          ftp.destroy();
          process.exit();
        }
      });
    });
  });
}

/**
 * @module
 */
module.exports = {
  /**
   * @desc deploy配置API
   * @param {String}-pattern 配置项
   * @param {Object}-options 配置参数
   */
  config: function(options) {
    // dev环境不存在deploy需求
    if(process.env.BOI_ENV == ENV.development){
      return;
    }
    if (!options || !_.isPlainObject(options)) {
      throw new Error(Log.error('Invalid deploy configuration,please check your config file'));
    }
    // 若没有区分环境进行配置，则直接使用options对象为配置项
    let _options = options[process.env.BOI_ENV] || options;

    this.options = Object.assign({}, _options);

    let _cdn = this.options.cdn;

    // cdn信息以全局变量的方式传递
    Object.defineProperty(global, 'boi_deploy_cdn', {
      enumerable: true,
      writable: false,
      value: _cdn
    });
  },
  /**
   * @desc 执行部署行为
   */
  run: function() {
    let _this = this;
    let _path = path.parse(_this.options.default.cdn.path);
    let _targetPath = path.posix.join('/', _this.options.default.cdn.path);
    let _config = config.getBoiConfig();

    // 连接建立成功后触发
    ftp.on('greeting', (msg) => {
      Log.info('Connection\'s been established');
      Log.info('Validating authentication...');
    });

    // 授权验证成功后触发
    ftp.on('ready', () => {
      Log.info('Authentication\'s been validated');
      Log.info('Reading target path...');

      // 列出目标目录的父级目录，以便查询目标目录是否存在
      ftp.list(_path.dir, false, (err, list) => {
        if (err) {
          console.log(Log.error(err.stack));
          ftp.destroy();
          process.exit();
        }
        // 匹配当前目标目录是否存在
        let _dirs = list.filter((item) => {
          return item.name === _path.name && item.type === 'd';
        });

        if (_dirs && _dirs.length !== 0) {
          // 目标目录存在
          uploadFiles(ftp, _config.basic.localPath.dest, _targetPath);
        } else {
          // 目标目录不存在
          Log.info('Creating \'' + _targetPath + '\'...');
          // 创建目标目录
          ftp.mkdir(_targetPath, (err) => {
            if (err) {
              console.log(Log.error(err.stack));
              ftp.destroy();
              process.exit();
            }
            uploadFiles(ftp, _config.basic.localPath.dest, _targetPath);
          });
        }
      })
    });
    // error立即关闭联系并终止进程
    ftp.on('error', (err) => {
      console.log(Log.error(err.stack));
      ftp.destroy();
      process.exit();
    });
    Log.info('Establishing connection...');
    // 建立连接
    ftp.connect(_this.options.default.connect);
  }
};
