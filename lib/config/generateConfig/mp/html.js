'use strict';

const _ = require('lodash');
const Path = require('path');
const Glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const HtmlWebpackPluginReplaceurl = require('html-webpack-plugin-replaceurl');
const Utils = require('../../../utils');
const ENV = require('../../../constants').env;

// 各类型文件对应的dependencies
const ENGINE_LOADERS_MAP = {
  html: {
    loaders: ['html-loader?-minimize&-removeComments&-collapseWhitespace'],
    deps: []
  },
  jade: {
    loaders: [
      'html-loader?-minimize&-removeComments&-collapseWhitespace',
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
      'html-loader?-minimize&-removeComments&-collapseWhitespace',
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
  // html configuration
  const CONFIG_HTML = config.html;

  let rules = [];
  let plugins = [];
  let dependencies = [];

  // 文件后缀
  const EXTTYPE = CONFIG_HTML.ext || 'html';
  // 模板引擎
  const ENGJINE = CONFIG_HTML.engine || 'html';
  // 匹配正则
  const REG_EXTTYPE = _.isArray(EXTTYPE) ? new RegExp('\\.(' + EXTTYPE.join(
      '|') + ')$') :
    new RegExp('\\.' + EXTTYPE + '$');

  let sourcePath = Path.join(process.cwd(), config.basic.source, CONFIG_HTML.source);
  let indexFiles = CONFIG_HTML.files || Glob.sync(Path.posix.join(
    sourcePath, '**', CONFIG_HTML.mainFilePrefix + '**.' + EXTTYPE));

  if (CONFIG_HTML.buildToHtml) {
    // buildToHtml为true时会将模板语法编译为标准的html语法
    rules.push({
      test: REG_EXTTYPE,
      loader: ENGINE_LOADERS_MAP[ENGJINE].loaders
    });

    dependencies = dependencies.concat(ENGINE_LOADERS_MAP[ENGJINE].deps);

    // 每个index.*.html主文件创建独立的HtmlWebpackPlugin对象
    if (indexFiles && indexFiles.length !== 0) {
      indexFiles.forEach(function (file) {
        plugins.push(new HtmlWebpackPlugin({
          // filename必须写相对路径，以output path为root
          filename: Path.join(CONFIG_HTML.output, Path.basename(
            file).replace(
            Path.extname(file), '.html')),
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
        useHash: process.env.BOI_ENV !== ENV.development && config.style
          .useHash ||
          false
      },
      vendor: config.js.splitCommonModule || (config.js.files && config
          .js.files.common) ?
        'common.js' : null,
      urlTimestamp: CONFIG_HTML.urlTimestamp || false
    }));
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
  } else {
    // buildToHtml为false时保留模板引擎语法
    // @todo
  }

  return {
    rules,
    plugins,
    dependencies
  };
};
