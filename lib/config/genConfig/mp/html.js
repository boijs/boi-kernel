'use strict'

let _ = require('lodash');
let path = require('path');
let glob = require('glob');
let webpack = require('webpack');
let HtmlWebpackPlugin = require('html-webpack-plugin');
let WebpackSrcmapPlugin = require('webpack-srcmap-plugin');
let FaviconsWebpackPlugin = require('favicons-webpack-plugin');
let HtmlWebpackPluginReplaceurl = require('html-webpack-plugin-replaceurl');
let HtmlWebpackPluginHtmlhint = require('html-webpack-plugin-htmlhint');

const ENV = require('../../../constants').env;

// 各类型文件对应的dependencies
const ENGINE_LOADERS_MAP = {
  html: {
    loaders: ['html-loader?-minimize&-removeComments&-collapseWhitespace'],
    deps: ['html-loader']
  },
  jade: {
    loaders: [
      'html-loader?-minimize&-removeComments&-collapseWhitespace',
      'jade-html-loader?pretty=true'
    ],
    deps: ['html-loader','jade-html-loader']
  },
  swig: {
    loaders: [
      'swig-loader'
    ],
    deps: ['swig-loader']
  },
  handlebars: {
    loaders: ['handlebars-loader'],
    deps: ['handlebars', 'handlebars-loader']
  },
  ejs: {
    loaders: [
      'html-loader?-minimize&-removeComments&-collapseWhitespace',
      'ejs-html-loader'
    ],
    deps: ['html-loader','ejs', 'ejs-html-loader']
  },
  mustache: {
    loaders: ['mustache-loader'],
    deps: ['mustache-loader']
  }
}

module.exports = function(config) {
  // html configuration
  const CONFIG_HTML = config.html;

  let preLoaders = [];
  let loaders = [];
  let postLoaders = [];
  let plugins = [];
  let dependencies = [];
  let extras = null;

  /// 如果用户配置了webpack loaders，则沿袭用户的配置
  CONFIG_HTML.webpackConfig && ((options) => {
    // check preLoader & preLoaders
    options.preLoader && _.isPlainObject(options.preLoader) && preLoaders.push(Object.assign({},
      CONFIG_HTML.webpackConfig.preLoader));
    options.preLoaders && _.isArray(options.preLoaders) && (preLoaders = preLoaders.concat(
      options.preLoaders));
    // check loader & loaders
    options.loader && _.isPlainObject(options.loader) && loaders.push(Object.assign({},
      CONFIG_HTML.webpackConfig.loader));
    options.loaders && _.isArray(options.loaders) && (preLoaders = loaders.concat(options.loaders));
    // check postloader & postloaders
    options.postloader && _.isPlainObject(options.postloader) && postLoaders.push(Object.assign({},
      CONFIG_HTML.webpackConfig.postloader));
    options.postloaders && _.isArray(options.postloaders) && (postLoaders = postLoaders.concat(
      options.postloaders));
    // check plugins
    options.plugins && (plugins = plugins.concat(options.plugins));
    // check extras
    extras = utils.mapWpExtras(options);
  })(CONFIG_HTML.webpackConfig);

  /**
   * @desc 生成默认配置
   * @return none
   */
  (() => {
    // 文件后缀
    const EXTTYPE = CONFIG_HTML.extType || 'html';
    // 模板引擎
    const ENGJINE = CONFIG_HTML.engine || 'html';
    // 匹配正则
    const REG_EXTTYPE = _.isArray(EXTTYPE) ? new RegExp('\\.(' + EXTTYPE.join('|') + ')$') :
      new RegExp('\\.' + EXTTYPE + '$');

    const REG_WITHEXT = new RegExp(CONFIG_HTML.srcDir + '\/' + CONFIG_HTML.mainFilePrefix +
      '\\.[\\w+\\.-]*\\.' + EXTTYPE + '$');

    let _srcDir = path.posix.join(process.cwd(), config.basic.localPath.src, CONFIG_HTML.srcDir);
    let _files = (CONFIG_HTML.files && CONFIG_HTML.files !== '*') || glob.sync(path.posix.join(
      _srcDir, '**', CONFIG_HTML.mainFilePrefix + '.*.' + EXTTYPE));

    // 如果loader为空，则使用默认的html-loader
    loaders.length === 0 && (() => {
      let _loader = null;
      if (CONFIG_HTML.buildToHtml) {
        _loader = ENGINE_LOADERS_MAP[ENGJINE].loaders.join('!');
        loaders.push({
          test: REG_EXTTYPE,
          loader: _loader
        });

        dependencies = dependencies.concat(ENGINE_LOADERS_MAP[ENGJINE].deps);

        /**
         * lint插件
         * @see https://github.com/boijs/html-webpack-plugin-htmlhint
         */
        process.env.BOI_ENV !== ENV.development && EXTTYPE === 'html' && CONFIG_HTML.lint &&
          ((options) => {
            let _configFile = '';
            if (options.lintConfigFile) {
              _configFile = path.isAbsolute(options.lintConfigFile) ? options.lintConfigFile :
                path.posix.join(process.cwd(), options.lintConfigFile);
            } else {
              try {
                _configFile = require.resolve(path.posix.join(process.cwd(),
                  'node_modules',
                  'boi-aux-rule-htmlhint'));
              } catch (e) {
                exec('npm install boi-aux-rule-htmlhint --registry=https://registry.npm.taobao.org --save-dev');
                _configFile = require.resolve(path.posix.join(process.cwd(),
                  'node_modules',
                  'boi-aux-rule-htmlhint'));
              }
            }
            plugins.push(new HtmlWebpackPluginHtmlhint({
              configFile: _configFile
            }));
          })(CONFIG_HTML);

        // 每个index.*.html主文件创建独立的HtmlWebpackPlugin对象
        if (_files && _files.length !== 0) {
          _files.forEach(function(file) {
            plugins.push(new HtmlWebpackPlugin({
              // filename必须写相对路径，以output path为root
              filename: CONFIG_HTML.keepExt && REG_WITHEXT.exec(file)[0] ||
                REG_WITHEXT.exec(file)[0].replace(REG_EXTTYPE, '.html'),
              template: file,
              inject: false,
              xhtml: false,
              minify: false,
              hash: false
            }));
          });
        }

        // 静态资源url替换
        plugins.push(new HtmlWebpackPluginReplaceurl({
          js: {
            mainFilePrefix: config.js.files ? '' : config.js.mainFilePrefix,
            useHash: process.env.BOI_ENV !== ENV.development && config.js.useHash ||
              false
          },
          style: {
            mainFilePrefix: config.style.files ? '' : config.style.mainFilePrefix,
            useHash: process.env.BOI_ENV !== ENV.development && config.style.useHash ||
              false
          },
          vendor: config.js.mutiEntriesVendor || (config.js.files && config.js.files.vendor) ?
            'vendor.js' : null,
          urlTimestamp: config.basic.urlTimestamp || false
        }));
        // 根据用户配置是否输出manifest文件
        if (CONFIG_HTML.staticSrcmap) {
          plugins.push(new WebpackSrcmapPlugin({
            outputfile: 'manifest.json',
            nameWithHash: true
          }));
        }
        // favicon plugin
        if (CONFIG_HTML.favicon) {
          plugins.push(new FaviconsWebpackPlugin({
            logo: path.posix.join(process.cwd(), CONFIG_HTML.favicon),
            inject: true,
            prefix: path.posix.join(config.image.destDir + '/favicons/'),
            statsFilename: 'iconstats.json',
            persistentCache: false,
            icons: {
              android: false,
              appleIcon: false,
              appleStartup: false,
              coast: false,
              favicons: true,
              firefox: false,
              opengraph: false,
              twitter: false,
              yandex: false,
              windows: false
            }
          }));
        }
      } else {}
    })();

  })();

  return {
    preLoaders,
    postLoaders,
    loaders,
    plugins,
    extras,
    dependencies
  };
}
