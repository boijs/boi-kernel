'use strict';

const _ = require('lodash');
const Path = require('path');
const Glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const HtmlWebpackPluginReplaceurl = require('html-webpack-plugin-replaceurl');
const ENV = require('../../../constants').env;

// 各类型文件对应的dependencies
const ENGINE_LOADERS_MAP = {
  html: {
    loaders: ['html-loader'],
    deps: []
  },
  jade: {
    loaders: [
      'html-loader',
      'jade-html-loader?pretty=true'
    ],
    deps: ['jade-html-loader']
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
      'html-loader',
      'ejs-html-loader'
    ],
    deps: ['ejs', 'ejs-html-loader']
  },
  mustache: {
    loaders: ['mustache-loader'],
    deps: ['mustache-loader']
  }
};

module.exports = function (config) {
  let rules = [];
  let plugins = [];
  let noParse = [];
  let dependencies = [];

  const CONFIG_HTML = config.html;

  if (CONFIG_HTML.webpackConfig) {
    // check rules
    CONFIG_HTML.webpackConfig.rules && (rules = CONFIG_HTML.webpackConfig.rules);
    // check plugins
    CONFIG_HTML.webpackConfig.plugins && (plugins = CONFIG_HTML.webpackConfig
      .plugins);
    // chack noParse
    CONFIG_HTML.webpackConfig.noParse && (noParse = CONFIG_HTML.webpackConfig
      .noParse);
  } else {
    // 文件后缀
    const EXTTYPE = CONFIG_HTML.ext || 'html';
    // 模板引擎
    const ENGJINE = CONFIG_HTML.engine || 'html';
    // 匹配正则
    const REG_EXTTYPE = _.isArray(EXTTYPE) ? new RegExp(
        `\\.(${EXTTYPE.join('|')})$`) :
      new RegExp('\\.' + EXTTYPE + '$');

    const SourcePath = Path.join(process.cwd(), config.basic.source,
      CONFIG_HTML.source);
    const IndexFiles = CONFIG_HTML.files || Glob.sync(Path.posix.join(
      SourcePath, '**', `+(${CONFIG_HTML.mainFilePrefix}.**.${EXTTYPE}|${CONFIG_HTML.mainFilePrefix}.${EXTTYPE})`));

    if (CONFIG_HTML.buildToHtml) {
      // buildToHtml为true时会将模板语法编译为标准的html语法
      rules.push({
        test: REG_EXTTYPE,
        use: ENGINE_LOADERS_MAP[ENGJINE].loaders
      });

      dependencies = dependencies.concat(ENGINE_LOADERS_MAP[ENGJINE].deps);

      // 如果只存在一个html入口文件，则使用inject注入chunks
      if(IndexFiles.length === 1){
        plugins.push(new HtmlWebpackPlugin({
          filename: Path.join(CONFIG_HTML.output, Path.basename(IndexFiles[0]).replace(Path.extname(IndexFiles[0]), '.html')),
          template: IndexFiles[0],
          inject: 'body',
          xhtml: false,
          minify: {
            removeComments: true,
            removeAttributeQuotes: false
          },
          hash: false
        }));
      }else if (IndexFiles.length > 1) {
        // 如果存在多个html文件，则分析各html文件的依赖chunks，使用html-webpack-plugin-replaceurl注入
        // @see https://github.com/boijs/html-webpack-plugin-replaceurl
        IndexFiles.forEach(file => {
          plugins.push(new HtmlWebpackPlugin({
            filename: Path.join(CONFIG_HTML.output, Path.basename(
              file).replace(Path.extname(file), '.html')),
            template: file,
            inject: false,
            xhtml: false,
            minify: {
              removeComments: true,
              removeAttributeQuotes: false
            },
            hash: false
          }));
        });
        // 静态资源url替换
        plugins.push(new HtmlWebpackPluginReplaceurl({
          js: {
            mainFilePrefix: config.js.files ? '' : config.js.mainFilePrefix,
            useHash: process.env.BOI_ENV !== ENV.development && config.js.useHash ||false,
            separator: '.',
            common: config.js.splitCommonModule || (config.js.files && config.js.files.common) ?true:false,
          },
          css: {
            mainFilePrefix: config.style.files ? '' : config.style.mainFilePrefix,
            useHash: process.env.BOI_ENV !== ENV.development && config.style.useHash ||false,
            separator: '.'
          },
          urlTimestamp: CONFIG_HTML.urlTimestamp || false,
          mode: CONFIG_HTML.staticLocateMode || 'loose'
        }));
      }

      // favicon plugin
      if (CONFIG_HTML.favicon) {
        plugins.push(new FaviconsWebpackPlugin({
          logo: Path.posix.join(process.cwd(), CONFIG_HTML.favicon),
          inject: true,
          prefix: Path.posix.join(config.image.output + '/favicons/'),
          statsFilename: 'iconstats.json',
          persistentCache: false,
          icons: {
            android: false,
            appleIcon: true,
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
    } else {
      // buildToHtml为false时保留模板引擎语法
      // @todo
    }
  }
  return {
    rules,
    noParse,
    plugins,
    dependencies
  };
};
