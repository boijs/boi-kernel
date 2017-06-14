'use strict';

require('shelljs/global');
const Path = require('path');
const Glob =  require('glob');
const Webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const GenerateMPForJS = require('./mp/js.js');
const GenerateMPForHTML = require('./mp/html.js');
const GenerateMPForStyle = require('./mp/style.js');
const GenerateMPForImage = require('./mp/image.js');

const ENV = require('../../constants').env;

module.exports = function (config) {
  let modules = {
    rules: [],
    noParse: []
  };

  let plugins = [];

  let dependencies = [];

  // dev环境下额外使用dev server需要的一组插件
  if (process.env.BOI_ENV === ENV.development) {
    plugins.push(new Webpack.HotModuleReplacementPlugin());
  }else if(config.basic.libs&&Glob.sync(Path.join(process.cwd(), config.basic.libs)).length!==0){
    plugins.push(new CopyWebpackPlugin([{
      from: Path.join(process.cwd(), config.basic.libs),
      to: Path.join(process.cwd(),config.basic.output,config.basic.libs),
      ignore: ['.*']
    }]));
  }

  // 插件比config API有更高优先级
  // 使用插件进行的配置将覆盖patternt同名配置项
  if (config.pluginPatterns && config.pluginPatterns.length !== 0) {
    config.pluginPatterns.forEach(function (pattern) {
      config[pattern] = null;
    });
  }

  /**
   * @desc image modules and plugins
   */
  ((mp) => {
    // concat rules
    mp.rules && mp.rules.length !== 0 && (modules.rules = modules.rules.concat(
      mp.rules));
    // concat plugins
    mp.plugins && mp.plugins.length !== 0 && (plugins = plugins.concat(mp.plugins));
    // concat noParse
    mp.noParse && mp.noParse.length !== 0 && (modules.noParse = modules.noParse
      .concat(mp.noParse));
    // concat dependencies
    mp.dependencies && mp.dependencies.length !== 0 && (dependencies =
      dependencies.concat(mp.dependencies));
  })(GenerateMPForImage(config));

  /**
   * @desc js modules and plugins
   */
  ((mp) => {
    // concat rules
    mp.rules && mp.rules.length !== 0 && (modules.rules = modules.rules.concat(
      mp.rules));
    // concat plugins
    mp.plugins && mp.plugins.length !== 0 && (plugins = plugins.concat(mp.plugins));
    // concat noParse
    mp.noParse && mp.noParse.length !== 0 && (modules.noParse = modules.noParse
      .concat(mp.noParse));
    // concat dependencies
    mp.dependencies && mp.dependencies.length !== 0 && (dependencies =
      dependencies.concat(mp.dependencies));
  })(GenerateMPForJS(config));

  /**
   * @desc style modules and plugins
   */
  ((mp) => {
    // concat rules
    mp.rules && mp.rules.length !== 0 && (modules.rules = modules.rules.concat(
      mp.rules));
    // concat plugins
    mp.plugins && mp.plugins.length !== 0 && (plugins = plugins.concat(mp.plugins));
    // concat noParse
    mp.noParse && mp.noParse.length !== 0 && (modules.noParse = modules.noParse
      .concat(mp.noParse));
    // concat dependencies
    mp.dependencies && mp.dependencies.length !== 0 && (dependencies =
      dependencies.concat(mp.dependencies));
  })(GenerateMPForStyle(config));

  /**
   * @desc html modules and plugins
   */
  ((mp) => {
    // concat rules
    mp.rules && mp.rules.length !== 0 && (modules.rules = modules.rules.concat(
      mp.rules));
    // concat plugins
    mp.plugins && mp.plugins.length !== 0 && (plugins = plugins.concat(mp.plugins));
    // concat noParse
    mp.noParse && mp.noParse.length !== 0 && (modules.noParse = modules.noParse
      .concat(mp.noParse));
    // concat dependencies
    mp.dependencies && mp.dependencies.length !== 0 && (dependencies =
      dependencies.concat(mp.dependencies));
  })(GenerateMPForHTML(config));


  return Object.assign({}, {
    plugins,
    dependencies,
    module: Object.assign({},modules,{
      noParse: new RegExp(modules.noParse.join('|'))
    })
  });
};
