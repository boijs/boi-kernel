'use strict'

let _ = require('lodash');
let path = require('path');
let webpack = require('webpack');
let utils = require('../../../utils');

const ENV = require('../../../constants').env;

module.exports = function(config) {
  let preLoaders = [];
  let loaders = [];
  let postLoaders = [];
  let plugins = [];
  let extras = null;
  let dependencies = [];

  const CONFIG_IMAGE = config.image;

  // 如果用户配置了webpack loaders，则沿袭用户的配置
  CONFIG_IMAGE.webpackConfig && ((options) => {
    // check preLoader & preLoaders
    options.preLoader && _.isPlainObject(options.preLoader) && preLoaders.push(Object.assign({},
      CONFIG_IMAGE.webpackConfig.preLoader));
    options.preLoaders && _.isArray(options.preLoaders) && (preLoaders = preLoaders.concat(
      options.preLoaders));
    // check loader & loaders
    options.loader && _.isPlainObject(options.loader) && loaders.push(Object.assign({},
      CONFIG_IMAGE.webpackConfig.loader));
    options.loaders && _.isArray(options.loaders) && (preLoaders = loaders.concat(options.loaders));
    // check postloader & postloaders
    options.postloader && _.isPlainObject(options.postloader) && postLoaders.push(Object.assign({},
      CONFIG_IMAGE.webpackConfig.postloader));
    options.postloaders && _.isArray(options.postloaders) && (postLoaders = postLoaders.concat(
      options.postloaders));
    // check plugins
    options.plugins && (plugins = plugins.concat(options.plugins));
    // check extras
    extras = utils.mapWpExtras(options);
  })(CONFIG_IMAGE.webpackConfig);

  /**
   * @desc 生成默认配置
   * @param  {Object} options
   * @return none
   */
  ((options) => {
    const REG_EXTTYPE = options.extType ? new RegExp('(' + options.extType.join('|') + ')$') :
      /\.((woff2?|svg)(\?v=[0-9]\.[0-9]\.[0-9]))|(woff2?|svg|jpe?g|png|gif|ico)$/;
    /**
     * @desc 如果loaders为空，则使用默认loaders
     */
    loaders.length === 0 && loaders.push((() => {
      let _loaders = [
        'image?{bypassOnDebug:true, progressive:true,optimizationLevel:3,pngquant:{quality:"65-80",speed:4}}'
      ];
      // 可配置小尺寸图片使用base64编码
      if (options.base64) {
        _loaders.push('url-loader?limit=' + (options.base64Limit | '10000') + '&name=' +
          options.destDir + (process.env.BOI_ENV !== ENV.development && options.useHash ?
            '/[name].[hash:8].[ext]' : '/[name].[ext]'));
      } else {
        let _cdn = global.boi_deploy_cdn && global.boi_deploy_cdn.image;
        _loaders.push('file-loader?name=' + (_cdn && _cdn.domain ? '' : path.posix.join(
          '/', options.destDir, '/')) + (process.env.BOI_ENV !== ENV.development &&
          options.useHash ? '[name].[hash:8].[ext]' : '[name].[ext]'));
      }
      return {
        test: REG_EXTTYPE,
        loaders: _loaders
      };
    })());
  })(CONFIG_IMAGE);

  return {
    preLoaders,
    postLoaders,
    loaders,
    plugins,
    extras,
    dependencies
  };
};
