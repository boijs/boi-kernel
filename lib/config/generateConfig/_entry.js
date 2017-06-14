'use strict';

const _ = require('lodash');
const Path = require('path');
const Glob = require('glob');
const Webpack = require('webpack');
const ENV = require('../../constants').env;
const HotClient = Path.join(__dirname, '../../assist/hotClient.js');

module.exports = function (config) {
  let entry = {};
  let plugins = [];

  const IsDevEnv = process.env.BOI_ENV === ENV.development;

  const CONFIG_JS = config.js;
  // js源文件目录绝对路径
  const JsSourcePath = Path.join(process.cwd(), config.basic.source,
    CONFIG_JS.source);
  // js源文件后缀类型
  const ExtType = CONFIG_JS.ext || 'js';
  // js入口文件的前缀，默认为main.*.[ext]
  const MainFilePrefix = CONFIG_JS.mainFilePrefix || 'main';

  // 如果详细配置入口文件，则只针对已配置的文件进行构建
  // 如果没有详细配置入口文件，则默认遍历指定js文件目录和子目录中所有以main.*.js命名的文件
  if (CONFIG_JS.files && CONFIG_JS.files.main && _.isPlainObject(CONFIG_JS.files
      .main)) {
    for (let filename in CONFIG_JS.files.main) {
      // 开发环境加入livereload辅助模块
      entry[filename] = IsDevEnv ? [
        HotClient,
        Path.posix.join(JsSourcePath, CONFIG_JS.files.main[filename])
      ] : Path.posix.join(JsSourcePath, CONFIG_JS.files.main[filename]);
    }
  } else {
    // 遍历目录及子目录，获取js入口文件的绝对路径
    const JsEntryFiles = Glob.sync(
      `${JsSourcePath}/**/${MainFilePrefix}.*.${ExtType}`);
    JsEntryFiles.forEach((filePath) => {
      let _filename = Path.basename(filePath).split(`\.${ExtType}`)[0];
      entry[_filename] = IsDevEnv ? [
        HotClient,
        filePath
      ] : filePath;
    });
  }

  const CommonFileName = `${CONFIG_JS.output}/common.${config.basic.appname}`;

  // 如果配置了common模块，则将common模块编译为独立的js文件
  if (CONFIG_JS.files && CONFIG_JS.files.common) {
    entry['common'] = CONFIG_JS.files.common;
    plugins.push(new Webpack.optimize.CommonsChunkPlugin({
      name: 'common',
      filename: !IsDevEnv&&CONFIG_JS.useHash?`${CommonFileName}.[chunkhash:8].js`:`${CommonFileName}.js`
    }));
  } else if (CONFIG_JS.splitCommonModule) {
    // 如果没有配置common模块，同时有一个以上entry模块，这种情况下仍然需要生成common模块
    // 此时的common模块没有任何逻辑相关代码，只包含webpack runtime
    // @see http://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin
    plugins.push(new Webpack.optimize.CommonsChunkPlugin({
      name: 'common',
      filename: `${CommonFileName}.js`,
      // @important chunks字段必填,否则会将style文件打包在一起
      chunks: []
    }));
  }
  return {
    entry,
    plugins
  };
};
