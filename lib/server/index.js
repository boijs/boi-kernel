'use strict'

require('babel-polyfill');

const DEFAULT_CONFIG = require('../constants/server.js').DEFAULT_CONFIG;

let Koa = require('koa');
let serve = require('koa-static');
let mount = require('koa-mount');

let path = require('path');
let colors = require('colors/safe');
let webpack = require("webpack");
let devMiddleware = require('koa-webpack-middleware').devMiddleware;
let hotMiddleware = require('koa-webpack-middleware').hotMiddleware;

let api_config = require('../api/config');

let server = module.exports = {};
let configuration = DEFAULT_CONFIG;
let app = new Koa();

server.config = function(config) {
    if (!config) {
        console.log(colors.red('Invalid configuration'));
        return;
    }
    configuration = Object.assign({}, configuration, config);
}

server.run = function() {
    let webpackConfig = api_config.webpackConfig;
    let boiConfig = api_config.api.getBoiConfig();

    if (!webpackConfig) {
        webpackConfig = api_config.api.genDevConfig();
    }

    let compiler = webpack(webpackConfig);
    let devServerConfig = Object.assign({}, DEFAULT_CONFIG.devServerConfig, {
        quiet: false,
        noInfo: false,
        publicPath: webpackConfig.output.publicPath,
        stats: {
            colors: true,
            chunks: false
        }
    });
    let _devMiddleware = devMiddleware(compiler, devServerConfig)
    let _hotMiddleware = hotMiddleware(compiler, {});

    // 第三方依赖文件的目录映射
    // @important 务必保证mount middleware的引入顺序在devMiddleware和hotMiddleware之前
    if (boiConfig.basic.localPath.thirdparty) {
        app.use(mount('/libs', serve(path.resolve(process.cwd(), boiConfig.basic.localPath.thirdparty))));
    }

    let htmlDir = path.resolve(process.cwd(), boiConfig.basic.localPath.src, boiConfig.html.srcDir);

    const REG_VIEWS_DIR = new RegExp('\/' + boiConfig.html.srcDir + '\/');

    app
        .use(function (ctx,next) {
            // html文件request映射到其源文件目录
            let req = ctx.request;
            // domain+html的请求重写url，映射至目标文件目录
            if (/\.html$/.test(req.url) && !REG_VIEWS_DIR.test(req.url)) {
                req.url = req.url.replace(/\//, '\/' + boiConfig.html.srcDir + '\/');
            }
            next();
        })
        .use(_devMiddleware)
        .use(_hotMiddleware);

    app.listen(configuration.port, function() {
        console.log(colors.blue('Server is listening ' + configuration.domain + ':port ' + configuration.port));
    });
};
