'use strict'

let path = require('path');
let _ = require('../../../utils/index.js');
let webpack = require('webpack');

module.exports = function(config,env) {
    let _preloader = null,
        _loader = null,
        _postloader = null;
    let _plugins = [];
    let _noParse = [
        'require',
        '$',
        'exports',
        'module.exports',
        'define'
    ];

    let _config = config.js;
    if (!_config) {
        return;
    }
    // 文件类型
    let _extType = _config.extType || 'js';

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
    // 如果loader为空，则使用默认loader
    // 默认loader只包含支持es2015语法的babel-loader
    if (!_loader) {
        let _exclude = [];
        if (config.basic.localPath.thirdparty) {
            _exclude.push(path.resolve(process.cwd(), config.basic.localPath.thirdparty));
        }
        _loader = ((options) => {
            // 默认支持es2015规范、转译Object.assign和Object spread
            return Object.assign({}, {
                test: reg_extType,
                exclude: _exclude,
                loader: 'babel',
                query: {
                    presets: [
                        'babel-preset-stage-0',
                        'babel-preset-es2015'
                    ].map(require.resolve),
                    plugins: [
                        "babel-plugin-transform-object-assign",
                        "babel-plugin-syntax-object-rest-spread"
                    ].map(require.resolve)
                }
            });
        })(_config);
    }
    // uglify
    if (_config.uglify && env !== 'dev') {
        _plugins.push(new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            sourceMap: false,
            test: reg_extType
        }));
    }
    return {
        preloader: _preloader,
        postloader: _postloader,
        loader: _loader,
        plugins: _plugins
    };
};
