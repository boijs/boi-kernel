'use strict'

// babel-polyfill for es6 generator usage
require("babel-polyfill");
let express = require('express');
let fs = require('fs');
let path = require('path');
let glob = require('glob');
let chalk = require('chalk');
let webpack = require("webpack");
let devMiddleware = require('webpack-dev-middleware');
let hotMiddleware = require('webpack-hot-middleware');
let api_config = require('../config');
let mock = require('./_mock');

const DEFAULT_CONFIG = require('../constants').server.config;

let configuration = DEFAULT_CONFIG;
let app = express();

let boiConfig = null;
let webpackConfig = null;

/**
 * @desc html文件url替换中间件
 * @param  {[type]}   req
 * @param  {[type]}   res
 * @param  {Function} next
 */
let middleware_redirurl = function(req, res, next) {
  // 如果项目只存在一个html文件，可以直接通过域名/IP:端口的格式访问
  if (req.url == '/') {
    let htmlDir = path.resolve(process.cwd(), boiConfig.basic.source, boiConfig.html.source);
    let files = glob.sync(path.join(htmlDir, '*.html'));
    if (files.length === 1) {
      req.url = path.posix.join('/', boiConfig.html.source, path.basename(files[0]));
    }
  } else if (/\.html$/.test(req.url) && /\w+/.test(boiConfig.html.source)) {
    let dirname = /\w+/.exec(boiConfig.html.source)[0];
    let reg_views_dir = new RegExp('^\/' + dirname + '\/.+\.html$');
    // html文件request映射到其源文件目录
    if (!reg_views_dir.test(req.url)) {
      req.url = req.url.replace(/\//, '\/' + dirname + '\/');
    }
  }
  next();
};

let server = module.exports = {};

server.mock = mock(app);

server.config = function(config) {
  if (!config) {
    console.log(chalk.red('Invalid configuration'));
    return;
  }
  configuration = Object.assign({}, configuration, config);
}

server.run = function() {
  boiConfig = api_config.getBoiConfig();

  if (!webpackConfig) {
    webpackConfig = api_config.generateWebpackConfig();
  }

  let compiler = webpack(webpackConfig);

  let devServerConfig = Object.assign({}, DEFAULT_CONFIG.devServerConfig, {
    publicPath: webpackConfig.output.publicPath
  });

  let _devMiddleware = devMiddleware(compiler, devServerConfig)
  let _hotMiddleware = hotMiddleware(compiler);

  // html文档更新触发浏览器自动刷新
  compiler.plugin('compilation', function(compilation) {
    compilation.plugin('html-webpack-plugin-after-emit', function(data, cb) {
      _hotMiddleware.publish({
        action: 'reload'
      });
      cb();
    });
  });
  // 第三方依赖文件的目录映射
  // @important 务必保证mount middleware的引入顺序在devMiddleware和hotMiddleware之前
  if (boiConfig.basic.libs) {
    let _staticPath = path.resolve(process.cwd(), boiConfig.basic.libs);
    app.use('/libs', express.static(_staticPath));
  }

  app
    .use(middleware_redirurl)
    .use(_devMiddleware)
    .use(_hotMiddleware);

  app.listen(configuration.port, function() {
    console.log(chalk.cyan.bold('==> Server is listening ' + configuration.domain + ':' +
      configuration.port));
  });

};
