// 生成output（本地）配置
'use strict'

let path = require('path');

const ENV = require('../../constants').env;

module.exports = function(config) {
  let output = null;
  let publicPath = '';
  // dest path
  let destPath = path.posix.join(process.cwd(), config.basic.localPath.dest);

  let _filename = process.env.BOI_ENV !== ENV.development && config.js.useHash ? '[name].[chunkhash:8].js' :'[name].js';
  let _chunkFilename = config.basic.appName + (config.js.useChunkHash ? '.[name].[chunkhash:8].js' :'.[name].js');

  let filename = path.posix.join(config.js.destDir, _filename);
  let chunkFilename = path.posix.join(config.js.destDir, 'part/', _chunkFilename);

  if(process.env.BOI_ENV === ENV.development){
    publicPath = '/';
  }else{
    // publicPath只编译cdn path，不编译cdn domain
    publicPath = config.basic.cdn && config.basic.cdn.path && path.posix.join(config.basic.cdn.path) || '/';
  }

  output = Object.assign({}, {
    path: destPath,
    filename: filename,
    publicPath: publicPath,
    chunkFilename: chunkFilename
  });
  return output;
}
