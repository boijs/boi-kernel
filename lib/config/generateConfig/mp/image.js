'use strict';

const _ = require('lodash');
const Path = require('path');
const Utils = require('../../../utils');
const ENV = require('../../../constants').env;

// 默认支持的后缀类型
const DefaultExts = [
  'jpg',
  'jpeg',
  'svg',
  'png',
  'eot',
  'ttf',
  'ico',
  'gif',
  'woff',
  'woff2'
];

module.exports = function (config) {
  let rules = [];
  let plugins = [];
  let dependencies = [];

  const CONFIG_IMAGE = config.image;

  rules = (() => {
    let _loaders = [];
    let _name = '';
    let _destDir = Path.posix.join(CONFIG_IMAGE.output.replace(/^\.?\//,
      '').replace(/\/$/, ''), '/');
    let reg = null;
    if (!CONFIG_IMAGE.ext || DefaultExts.indexOf(CONFIG_IMAGE.ext) !== -1) {
      reg = new RegExp(`\\.(${DefaultExts.join('|')})$`);
      // :/\.((woff2?|svg)(\?v=[0-9]\.[0-9]\.[0-9]))|(woff2?|svg|jpe?g|png|gif|ico)$/;
    } else {
      let exts = _.isArray(CONFIG_IMAGE.ext) ? DefaultExts.concat(
        CONFIG_IMAGE.ext) : DefaultExts.concat([CONFIG_IMAGE.ext]);
      reg = new RegExp(`\\.(${exts.join('|')})$`);
    }
    if (process.env.BOI_ENV === ENV.development) {
      _name = `${_destDir}[name].[ext]`;
    } else {
      const CdnInfo = global.boi_deploy_cdn && global.boi_deploy_cdn.image;
      _name = Path.posix.join((CdnInfo && CdnInfo.domain ? '' : _destDir), (
        CONFIG_IMAGE.useHash ? '[name].[hash:8].[ext]' :
        '[name].[ext]'));
    }
    if (CONFIG_IMAGE.base64) {
      _loaders.push(
        `url-loader?limit=${CONFIG_IMAGE.base64Limit}&name=${_name}`)
    } else {
      _loaders.push(`file-loader?name=${_name}`);
    }
    _loaders.push({
        loader: 'image-webpack-loader',
        options: {
          bypassOnDebug: true,
          progressive: true,
          optipng: {
            optimizationLevel: 3
          },
          pngquant: {
            quality: "65-80",
            speed: 4
          }
        }
      }
    );
    return {
      test: reg,
      use: _loaders
    };
  })();

  return {
    rules,
    plugins,
    dependencies
  };
};
