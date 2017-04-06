'use strict';

require('shelljs/global');

const _      = require('lodash');
const Path   = require('path');
const Config = require('../config');
const Log    = require('../utils').log;
const ENV    = require('../constants').env;

/**
 * @module
 * @desc 部署模块
 */
module.exports = {
  /**
   * @desc deploy配置API
   * @param {String}-pattern 配置项
   * @param {Object}-options 配置参数
   */
  config: function (options) {
    // dev环境不存在deploy需求
    if (process.env.BOI_ENV == ENV.development) {
      return;
    }

    if (!options || !_.isPlainObject(options)) {
      Log.error('Invalid deploy configuration,please check your config file');
      process.exit(0);
    }
    // 若没有区分环境进行配置，则直接使用options对象为配置项
    let _options = options[process.env.BOI_ENV] || options;

    this.options = Object.assign({}, _options.connect);

    // cdn信息以全局变量的方式传递
    Object.defineProperty(global, 'boi_deploy_cdn', {
      enumerable: true,
      writable: false,
      value: _options
    });
  },
  /**
   * @desc 执行部署行为
   */
  run: function () {
    const BoiConf = Config.getBoiConfig();
    let srcDir = Path.resolve(BoiConf.basic.output);
    let appName = BoiConf.basic.appname;
    /* eslint-disable */
    if (!test('-e', srcDir)) {
      Log.error('No dest files, please run build before deployment.');
      process.exit(0);
    }
    /* eslint-enable */

    switch (this.options.type) {
      case 'ftp':
        require('./_ftp.js')(this.options.config, srcDir, appName);
        break;
      case 'sftp':
        require('./_sftp.js')(this.options.config, srcDir, appName);
        break;
      default:
        Log.error('Invalid protocol type,please check your configuration');
        break;
    }
  }
};
