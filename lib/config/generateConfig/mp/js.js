'use strict';

require('shelljs/global');
const _ = require('lodash');
const Path = require('path');
const Webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const Utils = require('../../../utils');

const ENV = require('../../../constants').env;

module.exports = function (config) {
  let rules = [];
  let plugins = [];
  let noParse = [
    // 'require',
    // '$',
    // 'exports',
    // 'define'
  ];
  let extras = null;
  let dependencies = [];

  const CONFIG_JS = config.js;

  // 如果用户配置了webpack rules，则沿袭用户的配置
  if (CONFIG_JS.webpackConfig) {
    // // check rules
    // CONFIG_JS.webpackConfig.rules && rules = rules.concat(CONFIG_JS.webpackConfig
    //   .rules);
    // // check plugins
    // CONFIG_JS.webpackConfig.plugins && (plugins = plugins.concat(options.plugins));
    // // chack noParse
    // CONFIG_JS.webpackConfig.noParse && (noParse = noParse.concat(options.noParse));
    // // check extras
    // extras = Utils.mapWpExtras(options);
  } else {
    // 文件后缀
    const EXTTYPE = CONFIG_JS.ext || 'js';
    const REG_EXTTYPE = _.isArray(EXTTYPE) ? new RegExp('\\.(' + EXTTYPE.join(
        '|') + ')$') :
      new RegExp(
        '\\.' +
        EXTTYPE + '$');

    rules.push({
      test: REG_EXTTYPE,
      exclude: [
        /node_modules/,
        Path.posix.join(__dirname, '../entry')
      ],
      use: [{
        loader: 'babel-loader',
        options: {
          presets: [
            'babel-preset-stage-0',
            'babel-preset-es2015'
          ].map(require.resolve),
          plugins: [
            'babel-plugin-transform-object-assign',
            'babel-plugin-syntax-object-rest-spread'
          ].map(require.resolve)
        }
      }]
    });
    // define的value需要stringify后才可被正确应用
    if (CONFIG_JS.define && _.isPlainObject(CONFIG_JS.define)) {
      let _defineMap = {};
      for (let key in CONFIG_JS.define) {
        _defineMap[key] = JSON.stringify(CONFIG_JS.define[key]);
      }
      plugins.push(new Webpack.DefinePlugin(_defineMap));
    }
  }
  /**
   * @desc 生成默认配置
   * @param  {Object} options
   * @return none
   */
  // ((options) => {

  /**
   * @desc 非dev环境下加入eslint preLoader
   * @see http://eslint.cn
   */
  // process.env.BOI_ENV !== ENV.development && options.lint && (() => {
  //   let _configFile = '';
  //   if (options.lintConfigFile) {
  //     _configFile = Path.isAbsolute(options.lintConfigFile) ? options.lintConfigFile :
  //       Path.join(process.cwd(), options.lintConfigFile);
  //   } else {
  //     _configFile = require.resolve('boi-aux-rule-eslint');
  //   }
  //   extras = Object.assign({}, extras, {
  //     eslint: {
  //       formatter: require('eslint-friendly-formatter'),
  //       configFile: _configFile
  //     }
  //   });
  // /**
  //  * @desc 如果rules为空，则使用默认rules
  //  */
  // rules.length === 0 && rules.push((() => {
  //   // 默认支持es2015规范、转译Object.assign和Object spread
  //   return {
  //     test: REG_EXTTYPE,
  //     // include: _include,
  //     exclude: _exclude,
  //     loader: 'babel-loader',
  //     query: {
  //       presets: [
  //         'babel-preset-stage-0',
  //         'babel-preset-es2015'
  //       ].map(require.resolve),
  //       plugins: [
  //         'babel-plugin-transform-object-assign',
  //         'babel-plugin-syntax-object-rest-spread'
  //       ].map(require.resolve)
  //     }
  //   };
  // })());

  /**
   * @desc define plugin
   */
  //   (() => {
  //     let _defineMap = {};
  //     // define的value需要stringify后才可被正确应用
  //     if (options.define && _.isPlainObject(options.define)) {
  //       for (let key in options.define) {
  //         _defineMap[key] = JSON.stringify(options.define[key]);
  //       }
  //     }
  //     plugins.push(new Webpack.DefinePlugin(_defineMap));
  //   })();
  // })(CONFIG_JS);

  // production和testing环境下应用uglify
  // if (CONFIG_JS.uglify && process.env.BOI_ENV !== ENV.development) {
  //   plugins.push(new UglifyJSPlugin({
  //     compress: {
  //       warnings: false
  //     },
  //     sourceMap: false,
  //     mangle: false
  //       // mangle: {
  //       //   except: ['$', 'exports', 'require']
  //       // }
  //   }));
  // }

  return {
    rules,
    plugins,
    noParse,
    extras,
    dependencies
  };
};
