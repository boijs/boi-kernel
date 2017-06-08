'use strict';

require('shelljs/global');
const _ = require('lodash');
const Webpack = require('webpack');
const WebpackSplitHash = require('webpack-split-hash');
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

  let plugins = [
    // new WebpackSplitHash()
  ];

  let dependencies = [];

  // dev环境下额外使用dev server需要的一组插件
  if (process.env.BOI_ENV === ENV.development) {
    plugins.push(new Webpack.HotModuleReplacementPlugin());
  }

  // 插件比config API有更高优先级
  // 使用插件进行的配置将覆盖通过config API配置的同名项
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

  // 由自定义插件配置的module和plugin
  let mpFromPlugin = {
    rules: [],
    noParse: [],
    plugins: []
  };
  // 插件比config API有更高的优先级
  if (config.extraLoaders) {
    config.extraLoaders.forEach(function (v) {
      // check rules
      v.module.rules && v.module.rules.length !== 0 && (mpFromPlugin.rules =
        mpFromPlugin.rules
        .concat(v.module.rules));
      // check noParse
      v.noParse && (_.isArray(v.noParse) ? mpFromPlugin.noParse =
        mpFromPlugin.noParse.concat(v.noParse) : mpFromPlugin.noParse.push(
          v.noParse));
      // check plugins
      v.plugins && (mpFromPlugin.plugins = _.concat(mpFromPlugin.plugins,
        v.plugins));
    });
  }

  return Object.assign({}, {
    dependencies,
    module: Object.assign({}, modules, {
        rules: modules.rules.concat(mpFromPlugin.rules),
        noParse: new RegExp(modules.noParse.join('|'))
      }),
      plugins: plugins.concat(mpFromPlugin.plugins)
  });
};
