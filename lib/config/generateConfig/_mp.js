'use strict';

require('shelljs/global');
const _ = require('lodash');
const Webpack = require('webpack');
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
    plugins = plugins.concat([
      // hmr
      new Webpack.HotModuleReplacementPlugin()
    ]);
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

  // 插件比config API有更高的优先级
  if (config.pluginConfig && config.pluginConfig.length > 0) {
    config.pluginConfig.forEach(function (options) {
      // check rules
      options.rules && options.rules.length !== 0 && (modules.rules =
        modules.rules.concat(options.rules));
      // check noParse
      options.noParse && (_.isArray(options.noParse) ? modules.noParse =
        modules.noParse.concat(options.noParse) : modules.noParse
        .push(options.noParse));
      // check plugins
      options.plugins && (plugins = plugins.concat(options.plugins));
    });
  }

  return Object.assign({}, {
    plugins,
    dependencies,
    module: Object.assign({},modules,{
      noParse: new RegExp(modules.noParse.join('|'))
    })
  });
};
