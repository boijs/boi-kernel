'use strict'

let _ = require('lodash');
let path = require('path');
let webpack = require('webpack');
let utils = require('../../utils');

const ENV = require('../../constants').env;

module.exports = function(config) {
  let preLoaders = [];
  let loaders = [];
  let postLoaders = [];
  let plugins = [];
  let noParse = [
    'require',
    '$',
    'exports',
    'module.exports',
    'define'
  ];
  let extras = null;
  let dependencies = [];

  const CONFIG_JS = config.js;

  // 如果用户配置了webpack loaders，则沿袭用户的配置
  CONFIG_JS.webpackConfig && ((options) => {
    // check preLoader & preLoaders
    options.preLoader && _.isPlainObject(options.preLoader) && preLoaders.push(Object.assign({},
      CONFIG_JS.webpackConfig.preLoader));
    options.preLoaders && _.isArray(options.preLoaders) && (preLoaders = preLoaders.concat(
      options.preLoaders));
    // check loader & loaders
    options.loader && _.isPlainObject(options.loader) && loaders.push(Object.assign({},
      CONFIG_JS.webpackConfig.loader));
    options.loaders && _.isArray(options.loaders) && (preLoaders = loaders.concat(options.loaders));
    // check postloader & postloaders
    options.postloader && _.isPlainObject(options.postloader) && postLoaders.push(Object.assign({},
      CONFIG_JS.webpackConfig.postloader));
    options.postloaders && _.isArray(options.postloaders) && (postLoaders = postLoaders.concat(
      options.postloaders));
    // check plugins
    options.plugins && (plugins = plugins.concat(options.plugins));
    // chack noParse
    options.noParse && (noParse = noParse.concat(options.noParse));
    // check extras
    extras = utils.mapWpExtras(options);
  })(CONFIG_JS.webpackConfig);

  /**
   * @desc 生成默认配置
   * @param  {Object} options
   * @return none
   */
  ((options) => {
    // 文件后缀
    const EXTTYPE = options.extType || 'js';
    const REG_EXTTYPE = _.isArray(EXTTYPE) ? new RegExp('\\.(' + EXTTYPE.join('|') + ')$') :
      new RegExp(
        '\\.' +
        EXTTYPE + '$');
    // 排除不参与编译的文件
    let _exclude = [
      /node_modules/,
      path.posix.join(__dirname, 'assist')
    ];
    /**
     * @desc 非dev环境下加入eslint preLoader
     * @see http://eslint.cn
     */
    process.env.BOI_ENV !== ENV.development&&options.lint && (() => {
      extras = Object.assign({}, extras, {
        eslint: {
          formatter: require('eslint-friendly-formatter'),
          configFile: options.lintConfigFile ? path.posix.join(process.cwd(), options.lintConfigFile) : require
            .resolve('../../../../boi-aux-rule-eslint')
        }
      });
      let _include = path.posix.join(process.cwd(), config.basic.localPath.src)
      preLoaders.push({
        test: REG_EXTTYPE,
        loader: 'eslint',
        include: _include,
        exclude: _exclude
      });
    })();
    /**
     * @desc 如果loaders为空，则使用默认loaders
     */
    loaders.length === 0 && loaders.push((() => {
      // 默认支持es2015规范、转译Object.assign和Object spread
      return {
        test: REG_EXTTYPE,
        exclude: _exclude,
        loader: 'babel-loader',
        query: {
          presets: [
            'babel-preset-stage-0',
            'babel-preset-es2015'
          ].map(require.resolve),
          plugins: [
            'babel-plugin-transform-object-assign',
            'babel-plugin-syntax-object-rest-spread'
          ].map(require.resolve)
        }
      };
    })());
  })(CONFIG_JS);

  // production和testing环境下应用uglify
  if (CONFIG_JS.uglify && process.env.BOI_ENV !== ENV.development) {
    plugins.push(new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      sourceMap: false,
      mangle: {
        except: ['$', 'exports', 'require']
      }
    }));
  }

  return {
    preLoaders,
    postLoaders,
    loaders,
    plugins,
    noParse,
    extras,
    dependencies
  };
};
