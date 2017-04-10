'use strict';

const _ = require('lodash');
const Path = require('path');
const Glob = require('glob');
const Webpack = require('webpack');
const ENV = require('../../constants').env;

let __hot = Path.posix.join(__dirname, 'entry/hotClient.js');

module.exports = function (config) {
  let entry = {};
  let plugins = [];
  // js文件目录绝对路径
  let jsDir = Path.join(process.cwd(), config.basic.source, config.js.source);

  const CONFIG_JS = config.js;
  const ExtType = CONFIG_JS.ext || 'js';
  // js入口文件的前缀名称，默认为main.*.[js]
  const MainFilePrefix = CONFIG_JS.mainFilePrefix || 'main';
  // js入口文件的全名正则
  const REG_MAIN_FULL = new RegExp(MainFilePrefix + '\\.[\\w+\\.-]+\\.' + ExtType + '$');

  // 如果详细配置入口文件，则只针对已配置的文件进行构建
  // 如果没有详细配置入口文件，则默认遍历指定js文件目录和子目录中所有以main.*.js命名的文件
  if (CONFIG_JS.files && CONFIG_JS.files.main && _.isPlainObject(CONFIG_JS.files.main)) {
    for (let filename in CONFIG_JS.files.main) {
      if (REG_MAIN_FULL.test(CONFIG_JS.files.main[filename])) {
        entry[filename] = process.env.BOI_ENV === ENV.development ? [
          __hot,
          Path.posix.join(jsDir, CONFIG_JS.files.main[filename])
        ] : Path.posix.join(jsDir, CONFIG_JS.files.main[filename]);
      } else {
        entry[filename] = process.env.BOI_ENV === ENV.development ? [
          __hot,
          Path.posix.join(jsDir, CONFIG_JS.files.main[filename] + '.' + ExtType)
        ] : Path.posix.join(jsDir, CONFIG_JS.files.main[filename] + '.' + ExtType);
      }
    }
  } else {
    // 遍历目录及子目录，获取js入口文件的绝对路径
    let _jsEntries = Glob.sync(jsDir + '/**/' + MainFilePrefix + '.*.' + ExtType);
    _jsEntries.forEach((filePath) => {
      let _filename = REG_MAIN_FULL.exec(filePath)[0].split('\.' + ExtType)[0];
      entry[_filename] = process.env.BOI_ENV === ENV.development ? [__hot, filePath] :
        filePath;
    });
  }

  // 如果配置了common模块，则将common模块编译为独立的js文件
  if (CONFIG_JS.files && CONFIG_JS.files.common) {
    entry['common'] = CONFIG_JS.files.common;
    plugins.push(new Webpack.optimize.CommonsChunkPlugin({
      name: 'common',
      filename: Path.posix.join(config.js.output, '/common.' + config.basic.appname + '.js'),
      // @important chunks字段必填,否则会将style文件打包在一起
      chunks: entry['common']
    }));
  } else if (CONFIG_JS.splitCommonModule) {
    // 如果没有配置common模块，同时有一个以上entry模块，这种情况下仍然需要生成common模块
    // 此时的common模块没有任何逻辑相关代码，只包含webpack runtime
    // @see http://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin
    plugins.push(new Webpack.optimize.CommonsChunkPlugin({
      name: 'common',
      filename: Path.posix.join(config.js.output, '/common.' + config.basic.appname + '.js'),
      // @important chunks字段必填,否则会将style文件打包在一起
      chunks: []
    }));
  }
  return {
    entry,
    plugins
  };
};
