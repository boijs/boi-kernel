'use strict'

// babel-polyfill for es6 generator usage
require("babel-polyfill");
let express = require('express')
let fs = require('fs');
let path = require('path');
let chalk = require('chalk');
let webpack = require("webpack");
let devMiddleware = require('webpack-dev-middleware');
let hotMiddleware = require('webpack-hot-middleware');
let api_config = require('../config');

const DEFAULT_CONFIG = require('../constants/server.js').config;

let server = module.exports = {};
let configuration = DEFAULT_CONFIG;
let app = express();

let REG_VIEWS_DIR = null;
let boiConfig = null;
let webpackConfig = null;


let middleware_redirurl = function(req, res, next) {
    // 如果项目只存在一个html文件，可以直接通过域名+IP访问
    if (req.url === '/') {
        let htmlDir = path.resolve(process.cwd(), boiConfig.basic.localPath.src, boiConfig.html.srcDir);
        let files = fs.readdirSync(htmlDir);
        if (files.length === 0) {
            next();
        } else if (files.length === 1) {
            req.url = '/' + boiConfig.html.srcDir + '/' + files[0];
        }
    }
    // html文件request映射到其源文件目录
    if (/\.html/.test(req.url) && !REG_VIEWS_DIR.test(req.url)) {
        req.url = req.url.replace(/\//, '\/' + boiConfig.html.srcDir + '\/');
    }
    next();
};

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
        webpackConfig = api_config.genDevConfig();
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
    if (boiConfig.basic.localPath.thirdparty) {
        let _staticPath = path.resolve(process.cwd(), boiConfig.basic.localPath.thirdparty);
        app.use('/libs', express.static(_staticPath));
    }

    REG_VIEWS_DIR = new RegExp('\/' + boiConfig.html.srcDir + '\/');

    app
        .use(middleware_redirurl)
        .use(_devMiddleware)
        .use(_hotMiddleware);

    app.listen(configuration.port, function() {
        console.log(chalk.cyan.bold('==> Server is listening ' + configuration.domain + ':' + configuration.port));
    });

};
