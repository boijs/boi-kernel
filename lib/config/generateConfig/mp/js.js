'use strict';

require('shelljs/global');
const _ = require('lodash');
const Path = require('path');
const Webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const ENV = require('../../../constants').env;

module.exports = function (config) {
  let rules = [];
  let plugins = [];
  let noParse = [
    'jquery',
    'zepto',
    'lodash'
  ];
  let dependencies = [];

  const CONFIG_JS = config.js;

  // 如果用户配置了webpack rules，则沿袭用户的配置
  if (CONFIG_JS.webpackConfig) {
    // check rules
    CONFIG_JS.webpackConfig.rules && (rules = CONFIG_JS.webpackConfig.rules);
    // check plugins
    CONFIG_JS.webpackConfig.plugins && (plugins = CONFIG_JS.webpackConfig.plugins);
    // chack noParse
    CONFIG_JS.webpackConfig.noParse && (noParse = CONFIG_JS.webpackConfig.noParse);
  } else {
    // 文件后缀
    const EXTTYPE = CONFIG_JS.ext || 'js';
    const REG_EXTTYPE = _.isArray(EXTTYPE) ? new RegExp('\\.(' + EXTTYPE.join(
      '|') + ')$') : new RegExp('\\.' + EXTTYPE + '$');

    rules.push({
      test: REG_EXTTYPE,
      exclude: [
        /node_modules/,
        Path.posix.join(__dirname, '../../../assist')
      ],
      loader: 'babel-loader'
    });
    /* eslint-disable */
    exec(`cp ${Path.join(__dirname,'../../../assist/babelrc')} ${Path.join(process.cwd(),'.babelrc')}`,{
      slient: true
    });
    /* eslint-enable */
    dependencies = dependencies.concat([
      'babel-loader',
      'babel-core',
      'babel-preset-stage-0',
      'babel-preset-env',
      'babel-plugin-transform-object-assign',
      'babel-plugin-syntax-object-rest-spread',
      'babel-plugin-transform-runtime'
    ]);
  }

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

  // define plugins
  let defineMap = {};
  // define的value需要stringify后才可被正确应用
  if (CONFIG_JS.define && _.isPlainObject(CONFIG_JS.define)) {
    for (let key in CONFIG_JS.define) {
      defineMap[key] = JSON.stringify(CONFIG_JS.define[key]);
    }
  }
  plugins.push(new Webpack.DefinePlugin(defineMap));

  // production和testing环境下应用uglify
  if (CONFIG_JS.uglify && process.env.BOI_ENV !== ENV.development) {
    plugins.push(new UglifyJSPlugin({
      compress: {
        warnings: false
      },
      sourceMap: false,
      mangle: {
        except: ['$', 'exports', 'require']
      }
    }));
  }
// console.log(rules[0].use[0].options)
  return {
    rules,
    plugins,
    noParse,
    dependencies
  };
};
