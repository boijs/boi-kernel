'use strict'

require('babel-polyfill');

const Koa = require('koa');
const serve = require('koa-static');
const DEFAULT_CONFIG = require('../constants/server.js').DEFAULT_CONFIG;
const PORT = DEFAULT_CONFIG.port;
const DOMAIN = DEFAULT_CONFIG.domain;

let path = require('path');
let colors = require('colors/safe');
let webpack = require("webpack");
let devMiddleware = require('koa-webpack-middleware').devMiddleware;
let hotMiddleware = require('koa-webpack-middleware').hotMiddleware;

let api_config = require('../api/config');

let server = module.exports = {};
let configuration = null;
let app = new Koa();

server.config = function(config) {
    if (!config) {
        console.log(colors.red('Invalid configuration'));
        return;
    }
}

server.run = function() {
    let webpackConfig = api_config.webpackConfig;
    let boiConfig = api_config.api.getBoiConfig();

    if (!webpackConfig) {
        webpackConfig = api_config.api.genDevConfig();
    }
    let devServerConfig = Object.assign({}, DEFAULT_CONFIG.devServerConfig, {
        publicPath: webpackConfig.output.publicPath
    });
    let hmrConfig = {};

    let compiler = webpack(webpackConfig);

    app.use(devMiddleware(compiler, devServerConfig));
    app.use(hotMiddleware(compiler, hmrConfig));

    let staticPath = path.resolve(process.cwd(), webpackConfig.output.publicPath, boiConfig.basic.localPath
        .dest);
    app.use(serve(staticPath));

    app.listen(PORT, DOMAIN, function() {
        console.log(colors.blue('Server is listening ' + DOMAIN + ':port ' + PORT));
    })
};
