// 生成output（本地）配置
'use strict'

let path = require('path');

const ENV = require('../../constants').env;

module.exports = function(config) {
  let output = null;
  let publicPath = '';
  // dest path
  let destPath = path.posix.join(process.cwd(), config.basic.output);

  let _filename = process.env.BOI_ENV !== ENV.development && config.js.useHash ?
    '[name].[chunkhash:8].js' : '[name].js';
  let _chunkFilename = config.basic.appname + (config.js.asyncModuleHash ?
    '.[name].[chunkhash:8].js' : '.[name].js');

  let filename = path.posix.join(config.js.output, _filename);
  let chunkFilename = path.posix.join(config.js.output, 'part/', _chunkFilename);

  if (process.env.BOI_ENV === ENV.development) {
    publicPath = '/';
  } else {
    let _cdn = global.boi_deploy_cdn && global.boi_deploy_cdn.default;
    publicPath = (_cdn && _cdn.domain && _cdn.domain.replace(/^(http(s)?\:)?\/*/, '//').replace(
      /\/$/, '') + (_cdn.path && path.posix.join('/', _cdn.path,'/') || '/')) || '/';
  }

  output = Object.assign({}, {
    path: destPath,
    filename: filename,
    publicPath: publicPath,
    chunkFilename: chunkFilename
  });
  return output;
}
