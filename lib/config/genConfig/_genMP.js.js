'use strict'

let path = require('path');
let _ = require('lodash');
let webpack = require('webpack');
let utils = require('../../utils');

const ENV = require('../../constants').env;



module.exports = function(config) {
  let _preLoaders = [];
  let _loaders = [];
  let _postLoaders = [];
  let _plugins = [];
  let _noParse = [
    'require',
    '$',
    'exports',
    'module.exports',
    'define'
  ];
  let _extras = null;
  let _dependencies = [];

  let _config = config.js;

  // 如果用户配置了webpack loaders，则沿袭用户的配置
  _config.webpackConfig && ((options) => {
    // check preLoader & preLoaders
    options.preLoader && _.isPlainObject(options.preLoader) && _preLoaders.push(Object.assign({},
      _config.webpackConfig.preLoader));
    options.preLoaders && _.isArray(options.preLoaders) && (_preLoaders = _preLoaders.concat(
      options.preLoaders));
    // check loader & loaders
    options.loader && _.isPlainObject(options.loader) && _loaders.push(Object.assign({},
      _config.webpackConfig.loader));
    options.loaders && _.isArray(options.loaders) && (_preLoaders = _loaders.concat(options.loaders));
    // check postloader & postloaders
    options.postloader && _.isPlainObject(options.postloader) && _postLoaders.push(Object.assign({},
      _config.webpackConfig.postloader));
    options.postloaders && _.isArray(options.postloaders) && (_postLoaders = _postLoaders.concat(
      options.postloaders));
    // check plugins
    options.plugins && (_plugins = _plugins.concat(options.plugins));
    // chack noParse
    options.noParse && (_noParse = _noParse.concat(options.noParse));
    // check extras
    _extras = utils.mapWpExtras(options);
  })(_config.webpackConfig);

  /**
   * @desc 生成默认配置
   * @param  {Object} options
   * @return null
   */
  ((options)=>{
    // 文件后缀
    let _extType = options.extType || 'js';
    const REG_EXTTYPE = _.isArray(_extType) ? new RegExp('\\.(' + _extType.join('|') + ')$') : new RegExp(
      '\\.' +
      _extType + '$');
    // 排除不参与编译的文件
    let _exclude = [
      /node_modules/,
      path.posix.join(__dirname, 'assist')
    ];
    /**
     * @desc 加入lint preLoader
     */
    options.lint&&(()=>{
      let _eslint = {};
      _extras = Object.assign({},_extras,{
        eslint: {
          // formatter: require('eslint-friendly-formatter'),
          configFile: options.lintConfigFile||path.posix.resolve(__dirname,'./assist/_eslintrc.json')
        }
      });
      let _include = path.posix.resolve(process.cwd(),config.basic.localPath.src)
      _preLoaders.push({
        test: REG_EXTTYPE,
        loader: 'eslint',
        include: _include,
        exclude: _exclude
      });
    })();
    /**
     * @desc 如果loaders为空，则使用默认loaders
     */
    _loaders.length === 0 && _loaders.push((() => {
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
  })(_config);



  // production和testing环境下应用uglify
  if (_config.uglify && process.env.BOI_ENV !== ENV.development) {
    _plugins.push(new webpack.optimize.UglifyJsPlugin({
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
    preLoaders: _preLoaders,
    postloaders: _postLoaders,
    loaders: _loaders,
    plugins: _plugins,
    noParse: _noParse,
    extras: _extras,
    dependencies: _dependencies
  };
};
