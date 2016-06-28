/**
 * 配置独立style文件的编译项
 */
'use strict'
// webpack plugins
let webpack = require('webpack');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

let path = require('path');

module.exports = function(config, env) {
    let _loader = null,
        _preloader = null,
        _postloader = null;
    let _plugins = [];
    let _config = config.style;
    if (!_config) {
        return;
    }
    let _extType = _config.extType || 'css';

    let reg_extType = new RegExp('\\.' + _extType + '$');
    // @important 必须使用contenthash，不能用hash或chunkhash
    let _destFilename = _config.useHash ? '[name].[contenthash:8].css' : '[name].css';

    let _extractCSS = new ExtractTextPlugin(_config.destDir + '/' + _destFilename, {
        allChunks: true
    });

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
        // concat plugins
        if(_config.webpackConfig.plugins&&_config.webpackConfig.plugins.length!==0){
            _plugins = _plugins.concat(_config.webpackConfig.plugins);
        }
    }

    if (!_loader) {
        // style loader
        // 用户可以自行配置loaders，如果不自行配置则根据配置项自动生成
        _loader = ((options) => {
            // 图片可能被部署到独立的cdn
            // ExtractTextPlugin中publicPath配置的作用是替换style文件中引用图片的根目录
            let _imageCdn = null;
            if(env === 'prod'){
                if (config.image.cdn) {
                    _imageCdn = 'http://' + config.image.cdn;
                }else if(config.basic.cdn&&config.basic.cdn.server&&config.basic.cdn.path){
                    _imageCdn = 'http://'+config.basic.cdn.server+config.basic.cdn.path
                }
            }

            function generateLoaders(loaders) {
                if (_imageCdn) {
                    return _extractCSS.extract(loaders.join('!'), {
                        publicPath: _imageCdn
                    });
                } else {
                    return _extractCSS.extract(loaders.join('!'));
                }

            }
            let _loaders = {
                css: generateLoaders(['css']),
                postcss: generateLoaders(['css']),
                less: generateLoaders(['css', 'less']),
                sass: generateLoaders(['css', 'sass?indentedSyntax']),
                scss: generateLoaders(['css', 'sass']),
                stylus: generateLoaders(['css', 'stylus']),
                styl: generateLoaders(['css', 'stylus'])
            }
            return {
                test: reg_extType,
                loader: _loaders[_extType]
            };
        })(_config);

        _plugins.push(_extractCSS);
    }

    return {
        preloader: _preloader,
        postloader: _postloader,
        loader: _loader,
        plugins: _plugins
    };
}
