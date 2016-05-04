'use strict'

let path = require('path');
let glob = require('glob');
// webpack plugins
let webpack = require('webpack');
let HtmlWebpackPlugin = require('html-webpack-plugin');

let _ = require('../../../utils/index.js');

module.exports = function(config) {
    let _preloader = null,
        _loader = null,
        _postloader = null;
    let _plugins = [];

    let _config = config.html;
    if (!_config) {
        return;
    }
    // 文件类型
    let _extType = _config.extType || 'html';
    // 匹配正则
    let reg_extType = _.isPureArray(_extType) ? new RegExp('\\.(' + _extType.join('|') + ')$') : new RegExp('\\.' +
        _extType + '$');

    // 如果用户配置了webpack loader，则沿袭用户的配置
    if (_config.webpackConfig) {
        // preloader
        _preloader = (_config.webpackConfig.preloader && ((options) => {
            // 如果loader没有配置则返回null
            if (!options.loader) {
                return null;
            }
            return Object.assign({}, {
                test: options.test || reg_extType,
                loader: options.loader,
                query: options.query || null
            });
        })(_config.webpackConfig.preloader)) || null;
        // postloader
        _postloader = (_config.webpackConfig.postloader && ((options) => {
            if (!options.loader) {
                return null;
            }
            return Object.assign({}, {
                test: options.test || reg_extType,
                loader: options.loader,
                query: options.query || null
            });
        })(_config.webpackConfig.postloader)) || null;

        _loader = (_config.webpackConfig.loader && ((options) => {
            if (!options.loader) {
                return null;
            }
            return Object.assign({}, {
                test: options.test || reg_extType,
                loader: options.loader,
                query: options.query || null
            });
        })(_config.webpackConfig.loader)) || null;
    }
    // 如果用户配置了plugin，则使用用户配置
    // 默认基于模板源文件进行编译
    if (_config.webpackConfig && _config.webpackConfig.plugins && _config.webpackConfig.plugins.length !== 0) {
        _plugins.concat(_config.webpackConfig.plugins);
    } else {
        let __plugins = ((options) => {
            let __htmlPlugins = [];
            let _srcTpl = path.resolve(process.cwd(), config.basic.localPath.src, _config.dirname);
            let _destTpl = path.resolve(process.cwd(), config.basic.localPath.dest);
            let _files = (_config.files && _config.files !== '*') || glob.sync(_srcTpl + '/**/*.' +
                _extType);
            const REG_WITHEXT = new RegExp(_config.dirname + '\/(\\w|\/|\.?)+\.' + _extType + '$');
            if (_files && _files.length !== 0) {
                _files.forEach(function(file) {
                    __htmlPlugins.push(new HtmlWebpackPlugin({
                        // filename必须写相对路径，以output path为root
                        filename: REG_WITHEXT.exec(file)[0],
                        template: file,
                        inject: true,
                        xhtml: true,
                        minify: false
                    }));
                });
            }
            return __htmlPlugins;
        })(_config);
        _plugins = _plugins.concat(__plugins);
    }

    // 如果loader为空，则使用默认loader
    // 默认loader是html-loader
    if (!_loader) {
        _loader = ((options) => {
            return Object.assign({}, {
                test: reg_extType,
                loader: 'html',
                query: {
                    // 保留html注释
                    "removeComments": false,
                    // 不压缩
                    "collapseWhitespace": false
                }
            });
        })(_config);
    }

    return {
        preloader: _preloader,
        postloader: _postloader,
        loader: _loader,
        plugins: _plugins
    };
}
