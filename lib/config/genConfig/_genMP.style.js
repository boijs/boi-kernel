/**
 * 配置独立style文件的编译项
 */
'use strict'
// webpack plugins
let webpack = require('webpack');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let _ = require('lodash');
let path = require('path');

const ENV = require('../../constants').env;
const EXT_DEPS_MAP = {
    css: ['css-loader'],
    postcss: ['css-loader'],
    less: ['css-loader','less-loader'],
    scss: ['css-loader','sass-loader','node-sass'],
    sass: ['css-loader','sass-loader','node-sass'],
    stylus: ['css-loader','stylus-loader'],
    styl: ['css-loader','stylus-loader']
}

module.exports = function(config) {
    let _loader = null,
        _preloader = null,
        _postloader = null;
    let _plugins = [];

    let _dependencies = [];

    let _config = config.style;

    if (!_config) {
        return;
    }
    let _extType = _config.extType || 'css';

    // 获取编译环境变量，默认dev
    let _env = process.env.BOI_ENV || ENV.testing;

    let reg_extType = new RegExp('\\.' + _extType + '$');
    // @important 必须使用contenthash，不能用hash或chunkhash
    let _destFilename = _env === ENV.production&&_config.useHash ? '[name].[contenthash:8].css' : '[name].css';

    let _extractCSS = new ExtractTextPlugin(_config.destDir + '/' + _destFilename, {
        allChunks: true
    });

    // 如果用户配置了webpack loader，则沿袭用户的配置
    if (_config.webpackConfig) {
        // preloader
        _preloader = _config.webpackConfig.preloader|| null;
        // postloader
        _postloader = _config.webpackConfig.postloader|| null;

        _loader = _config.webpackConfig.loader|| null;
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
            let __imageCdn = null;
            if(_env === ENV.production){
                if (config.image.cdn) {
                    __imageCdn = 'http://' + config.image.cdn;
                }else if(config.basic.cdn&&config.basic.cdn.server&&config.basic.cdn.path){
                    __imageCdn = 'http://'+path.posix.join(config.basic.cdn.server,config.basic.cdn.path)
                }
            }

            function generateLoaders(loaders) {
                if (__imageCdn) {
                    return _extractCSS.extract(loaders.join('!'), {
                        publicPath: __imageCdn
                    });
                } else {
                    return _extractCSS.extract(loaders.join('!'));
                }

            }
            let __loaders = {
                css: _config.autoprefix ? generateLoaders(['css']):generateLoaders(['css?-autoprefixer']),
                postcss: _config.autoprefix ? generateLoaders(['css']):generateLoaders(['css?-autoprefixer']),
                less: _config.autoprefix ? generateLoaders(['css', 'less']):generateLoaders(['css?-autoprefixer', 'less']),
                sass: _config.autoprefix ? generateLoaders(['css', 'sass?indentedSyntax']):generateLoaders(['css?-autoprefixer', 'sass?indentedSyntax']),
                scss: _config.autoprefix ? generateLoaders(['css', 'sass']):generateLoaders(['css?-autoprefixer', 'sass']),
                stylus: _config.autoprefix ? generateLoaders(['css', 'stylus']):generateLoaders(['css?-autoprefixer', 'stylus']),
                styl: _config.autoprefix ? generateLoaders(['css', 'stylus']):generateLoaders(['css?-autoprefixer', 'stylus'])
            }
            return {
                test: reg_extType,
                loader: __loaders[_extType]
            };
        })(_config);

        _plugins.push(_extractCSS);
        /*
        生成依赖
         */
        _dependencies = _.concat(((type)=>{
            let _deps = [];
            let _loaders = EXT_DEPS_MAP[type];
            let _reg=/\?/;
            _deps = _loaders.filter(function(loader){
                if(_reg.test(loader)){
                    loader = loader.split(_reg)[0];
                }
                return loader !== 'css-loader';
            });
            return _deps;
        })(_extType));
    }

    return {
        preloader: _preloader,
        postloader: _postloader,
        loader: _loader,
        plugins: _plugins,
        dependencies: _dependencies
    };
}
