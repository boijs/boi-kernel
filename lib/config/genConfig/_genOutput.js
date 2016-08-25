// 生成output（本地）配置
'use strict'

let path = require('path');

const ENV = require('../../constants').env;

module.exports = function(config) {
  let isDev = process.env.BOI_ENV === ENV.development;

  let output = null;
  let publicPath = '';
  // dest path
  let destPath = path.posix.join(process.cwd(), config.basic.localPath.dest);

  let _filename = !isDev && config.js.useHash ? '[name].[chunkhash:8].js' :'[name].js';
  let _chunkFilename = config.basic.appName + (config.js.useHash ? '.[name].[chunkhash:8].js' :'.[name].js');

  let filename = path.posix.join(config.js.destDir, _filename);
  let chunkFilename = path.posix.join(config.js.destDir, 'part/', _chunkFilename);

  // publicPath用来配置cdn url
  publicPath = !isDev && config.basic.cdn ? 'http://' + path.posix.join(config.basic.cdn.server, config.basic.cdn.path) : '/'

  output = Object.assign({}, {
    path: destPath,
    filename: filename,
    publicPath: publicPath,
    chunkFilename: chunkFilename
  });
  return output;
}
