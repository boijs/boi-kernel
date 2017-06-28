'use strict';

require('babel-polyfill');
require('shelljs/global');
const Express = require('express');
const Path = require('path');
const Webpack = require('webpack');
const BoiConfAPI = require('../config');
const Log = require('../utils').log;
const Mock = require('./_mock');
const DEFAULT_CONFIG = require('../constants').server.config;

const App = Express();

let serveConfig = DEFAULT_CONFIG;
let boiConfig = null;
let webpackConfig = null;

/**
 * @desc view path替换中间件
 * @param  {[type]}   req
 * @param  {[type]}   res
 * @param  {Function} next
 */
function redirectMiddleware(req, res, next) {
  const viewDir = Path.basename(boiConfig.html.source);
  if (/\.html$/.test(req.url) && viewDir!=='.'&&viewDir!=='/') {
    const Reg_views_dir = new RegExp(`^\/${viewDir}\/.+\.html$`);
    // html文件request映射到其源文件目录
    if (!Reg_views_dir.test(req.url)) {
      req.url = req.url.replace(/\//, `\/${viewDir}\/`);
    }
  }
  next();
}

const Server = module.exports = {};

Server.mock = Mock(App);

Server.config = function (config) {
  if (!config) {
    Log.error('Invalid serveConfig');
    process.exit();
  }
  serveConfig = Object.assign({}, serveConfig, config);
};

Server.run = function (isInstall) {
  boiConfig = BoiConfAPI.getBoiConfig();

  if (!webpackConfig) {
    webpackConfig = BoiConfAPI.generateWebpackConfig(isInstall);
  }

  const compiler = Webpack(webpackConfig);

  const devServerConfig = Object.assign({}, serveConfig.devServerConfig, {
    publicPath: webpackConfig.output.publicPath,
    // 默认首页为index.html
    index: `${Path.basename(boiConfig.html.output)}/index.html`
  });

  const DevMiddleware = require('webpack-dev-middleware')(compiler, devServerConfig);
  const HotMiddleware = require('webpack-hot-middleware')(compiler);

  DevMiddleware.waitUntilValid(function () {
    Log.info(`Server is listening at localhost: ${serveConfig.port}\n`);
  });
  // html文档更新触发浏览器自动刷新
  compiler.plugin('compilation', function (compilation) {
    compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
      HotMiddleware.publish({
        action: 'reload'
      });
      cb();
    });
  });
  // 开启spirites功能时将其输出目录加入静态服务
  if(boiConfig.style.sprites){
    App.use(`/${Path.basename(boiConfig.image.output)}`, Express.static(Path.join(process.cwd(),boiConfig.basic.output,boiConfig.image.output)));
  }
  // 第三方依赖文件的目录映射
  // @important 务必保证mount middleware的引入顺序在devMiddleware和hotMiddleware之前
  if (boiConfig.basic.libs) {
    const _staticPath = Path.join(process.cwd(), boiConfig.basic.libs);
    App.use(`/${Path.basename(boiConfig.basic.libs)}`, Express.static(_staticPath));
  }

  /* eslint-disable */
  rm('-rf', Path.resolve(boiConfig.basic.output));
  /* eslint-enable */
  App
    .use(redirectMiddleware)
    .use(DevMiddleware)
    .use(HotMiddleware);

  App.listen(serveConfig.port, (err) => {
    if (err) {
      throw new Error(err);
    }
  });

};
