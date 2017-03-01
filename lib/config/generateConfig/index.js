'use strict'

const _                       = require('lodash');
const Path                    = require('path');
const ExtractTextPlugin       = require('extract-text-webpack-plugin');
const GenerateEntry           = require('./_entry.js');
const GenerateOutput          = require('./_output.js');
const GenerateModuleAndPlugin = require('./_mp.js');
const Env                     = require('../../constants').env;

/**
 * @module
 * @desc 生成webpack配置以及依赖包
 * @param config {Object} - 用户配置项
 */
module.exports = (config) => {
  let moduleAndPlugins = GenerateModuleAndPlugin(config);
  let entryAndPlugins  = GenerateEntry(config);
  let entry            = entryAndPlugins.entry;
  let output           = GenerateOutput(config);
  let modules          = moduleAndPlugins.module;
  let plugins          = moduleAndPlugins.plugins.concat(entryAndPlugins.plugins);

  let extraResolvePath = ((extra) => {
    let _paths = [];
    if (!extra || extra.length === 0) {
      return _paths;
    }
    extra.forEach(function (v) {
      if (v.reslovePath && _.isString(v.reslovePath)) {
        _paths.push(Path.resolve(process.cwd(), 'node_modules', v.reslovePath));
      }
    });
    return _paths;
  })(config.extraLoaders);

  // npmGlobalPath获取npm global模块的路径
  // 默认情况下，使用nvm管理node的环境下，global模块不能被resolve解析，参考https://github.com/creationix/nvm/pull/97
  let npmGlobalPath = _.trim(exec('npm root -g',{silent: true}).stdout);

  // 配置webpack loader的寻址路径
  // Path.resolve(__dirname, '../../../node_modules')是构建工具自身的模块目录
  // Path.resolve(process.cwd())是具体项目的模块目录
  let resolveLoader = {
    modulesDirectories: ["node_modules"],
    fallback: [
      Path.resolve(__dirname, '../../../node_modules'),
      Path.resolve(process.cwd(), 'node_modules'),
      npmGlobalPath
    ].concat(extraResolvePath)
  };

  // 资源模块的寻址路径配置
  let resolve = {
    modulesDirectories : ["node_modules"],
    fallback           : [
      Path.resolve(__dirname, '../../../node_modules'),
      Path.resolve(process.cwd(), 'node_modules'),
      npmGlobalPath
    ].concat(extraResolvePath)
  };

  return {
    wp : Object.assign({
      entry         : entry,
      output        : output,
      module        : modules,
      plugins       : plugins,
      resolveLoader : resolveLoader,
      resolve       : resolve,
      devtool       : process.env.BOI_ENV === Env.development ? 'source-map' : ''
    }, moduleAndPlugins.extras),
    dependencies : moduleAndPlugins.dependencies
  };
}
