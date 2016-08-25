// 生成module loader和plugins配置项
'use strict'

require('shelljs/global');

let path = require('path');
let ora = require('ora');
let _ = require('lodash');

let webpack = require('webpack');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let WebpackMd5Hash = require('webpack-md5-hash');

let fn_genMPStyle = require('./_genMP.style.js');
let fn_genMPJs = require('./_genMP.js.js');
let fn_genMPHtml = require('./_genMP.html.js');

const ENV = require('../../constants').env;

let spinner = ora();
spinner.color = 'blue';


module.exports = function(config, env) {
  let _result = null;
  let _module = null
  let _plugins = [];

  /*
   webpack配置项
   */
  let _loaders = [];
  let _preLoaders = [];
  let _postLoaders = [];
  let _noParse = [];
  let _extras = null;

  /*
  loaders
   */
  let _loader_image = null;

  /*
  依赖模块数组
   */
  let _dependencies = [];

  _plugins = _plugins.concat([
    new webpack.optimize.OccurrenceOrderPlugin(true),
    // clean before build
    new CleanWebpackPlugin([path.posix.join(process.cwd(), config.basic.localPath.dest)], {
      root: '/',
      verbose: false,
      dry: false
    }),
    // md5 hash
    new WebpackMd5Hash()
  ]);

  // dev环境下额外使用dev server需要的一组插件
  if (env === 'dev') {
    _plugins = _plugins.concat([
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoErrorsPlugin()
    ])
  }

  // 插件比config API有更高优先级
  // 使用插件进行的配置（extend类型除外）将覆盖通过config API配置的同名项
  if (config.pluginPatterns && config.pluginPatterns.length !== 0) {
    config.pluginPatterns.forEach(function(pattern) {
      config[pattern] = null;
    });
  }
  /**
   * webpack编译image相关配置
   * 用户可以自行配置loaders，如果不自行配置则根据boi配置项生成
   */
  _loader_image = (config.image.webpackConfig && config.image.webpackConfig.loader) || ((opts) => {
    let __test = opts.extType ? new RegExp('(' + opts.extType.join('|') + ')$') :
      /\.((woff2?|svg)(\?v=[0-9]\.[0-9]\.[0-9]))|(woff2?|svg|jpe?g|png|gif|ico)$/;
    let __loaders = [];
    __loaders.push(
      'image?{bypassOnDebug:true, progressive:true,optimizationLevel:3,pngquant:{quality:"65-80",speed:4}}'
    );
    // 可配置小尺寸图片使用base64编码
    if (opts.base64) {
      __loaders.push('url-loader?limit=' + (opts.base64Limit | '10000') +
        '&name=' + opts.destDir + (env === 'prod' && opts.useHash ?
          '/[name].[hash:8].[ext]' : '/[name].[ext]'));
    } else {
      __loaders.push('url-loader?name=' + (opts.cdn ? '' : (opts.destDir || 'image')) +
        (env === 'prod' && opts.useHash ? '/[name].[hash:8].[ext]' : '/[name].[ext]'));
    }

    return {
      test: __test,
      loaders: __loaders
    }
  })(config.image);
  // image plugins
  if (config.image.webpackConfig && config.image.webpackConfig.plugins && config.image.webpackConfig
    .plugins.length !== 0) {
    _plugins = _plugins.concat(config.image.webpackConfig.plugins);
  }

  _loaders.push(_loader_image);

  /**
   * @desc js modules and plugins
   */
  ((mp) => {
    // concat preLoaders
    mp.preLoaders && mp.preLoaders.length !== 0 && (_preLoaders = _preLoaders.concat(
      mp.preLoaders));
    // concat postloaders
    mp.postloaders && mp.postloaders.length !== 0 && (_postLoaders = _postLoaders.concat(
      mp.postloaders));
    // concat loaders
    mp.loaders && mp.loaders.length !== 0 && (_loaders = _loaders.concat(mp.loaders));
    // concat plugins
    mp.plugins && mp.plugins.length !== 0 && (_plugins = _plugins.concat(mp.plugins));
    // concat noParse
    mp.noParse && mp.noParse.length !== 0 && (_noParse = _noParse.concat(mp.noParse));
    // concat dependencies
    mp.dependencies && mp.dependencies.length !== 0 && (_dependencies = _dependencies.concat(mp
      .dependencies));
    mp.extras && Object.keys(mp.extras)!==0&&(_extras = Object.assign({},_extras,mp.extras));
  })(fn_genMPJs(config));
  /*
   * webpack编译style相关配置
   */
  let _mp_style = fn_genMPStyle(config, env);
  if (_mp_style) {
    if (_mp_style.preloader) {
      _preLoaders.push(_mp_style.preloader);
    }
    // if (_mp_style.postloader) {
    //   _postLoaders.push(_mp_style.postloader);
    // }
    if (_mp_style.plugins) {
      _plugins = _plugins.concat(_mp_style.plugins);
    }
    _loaders.push(_mp_style.loader);
  }

  /*
   * webpack编译html相关配置
   */
  let _mp_html = fn_genMPHtml(config);
  if (_mp_html) {
    if (_mp_html.preloader) {
      _preLoaders.push(_mp_html.preloader);
    }
    // if (_mp_html.postloader) {
    //   _postLoaders.push(_mp_html.postloader);
    // }
    if (_mp_html.plugins) {
      _plugins = _plugins.concat(_mp_html.plugins);
    }
    _loaders.push(_mp_html.loader);
  }
  /*
  依赖模块收集
   */
  _dependencies = _dependencies.concat(_mp_style.dependencies, _mp_html.dependencies)

  // 由自定义插件配置的module和plugin
  let _extraMP = {
    preloader: [],
    postloader: [],
    loaders: [],
    noParse: [],
    plugins: []
  };
  // 插件比config API有更高的优先级
  if (config.extraLoaders) {
    let _needInstall = parseInt(exec('npm -v')) < 3;
    config.extraLoaders.forEach(function(v, i) {
      v.module.loader && _extraMP.loaders.push(v.module.loader);
      v.module.loaders && v.module.loaders.length !== 0 && (_extraMP.loaders = _.concat(
        _extraMP.loaders, v.module.loaders));
      v.module.preloader && _extraMP.preloader.push(v.module.preloader);
      v.module.postloader && _extraMP.postloader.push(v.module.postloader);
      v.noParse && _extraMP.noParse.push(v.noParse);
      v.plugins && (_extraMP.plugins = _.concat(_extraMP.plugins, v.plugins));
      // webpack额外配置项
      if (v.extra) {
        _extras = Object.assign({}, _extras, v.extra);
      }
      // npm 3.0.0以下版本node_modules无限嵌套引起无法寻址
      // 所以将自定义插件的依赖全部安装在一级node_modules目录
      if (_needInstall) {
        if (v.dependencies && v.dependencies.length !== 0) {
          _dependencies = _.concat(_dependencies, v.dependencies);
        }
      }
    });
  }

  _module = Object.assign({}, {
    preLoaders: _preLoaders,
    loaders: _loaders.concat(_extraMP.loaders),
    postLoaders: _postLoaders,
    noParse: _noParse
  });

  return Object.assign({}, {
    module: _module,
    plugins: _plugins.concat(_extraMP.plugins),
    extras: _extras,
    dependencies: _dependencies
  });
}
