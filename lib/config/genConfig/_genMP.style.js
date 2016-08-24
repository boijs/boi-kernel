/**
 * 配置独立style文件的编译项
 */
'use strict'
// webpack plugins
let webpack = require('webpack');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let _ = require('lodash');
let path = require('path');

const EXT_MAP = {
    css: ['css'],
    postcss: ['css'],
    less: ['css','less'],
    scss: ['css','sass'],
    sass: ['css','sass?indentedSyntax'],
    stylus: ['css','stylus'],
    styl: ['css','stylus']
}

module.exports = function(config, env) {
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

    let reg_extType = new RegExp('\\.' + _extType + '$');
    // @important 必须使用contenthash，不能用hash或chunkhash
    let _destFilename = env === 'prod'&&_config.useHash ? '[name].[contenthash:8].css' : '[name].css';

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
            let _imageCdn = null;
            if(env === 'prod'){
                if (config.image.cdn) {
                    _imageCdn = 'http://' + config.image.cdn;
                }else if(config.basic.cdn&&config.basic.cdn.server&&config.basic.cdn.path){
                    _imageCdn = 'http://'+path.join(config.basic.cdn.server,config.basic.cdn.path)
                }
            }

            function generateLoaders(type) {
                let _loaders = EXT_MAP[type];

                if (_imageCdn) {
                    return _extractCSS.extract(_loaders.join('!'), {
                        publicPath: _imageCdn
                    });
                } else {
                    return _extractCSS.extract(_loaders.join('!'));
                }

            }
            let _loaders = {
                css: generateLoaders(['css?-autoprefixer']),
                postcss: generateLoaders(['css?-autoprefixer']),
                less: generateLoaders(['css?-autoprefixer', 'less']),
                sass: generateLoaders(['css?-autoprefixer', 'sass?indentedSyntax']),
                scss: generateLoaders(['css?-autoprefixer', 'sass']),
                stylus: generateLoaders(['css?-autoprefixer', 'stylus']),
                styl: generateLoaders(['css?-autoprefixer', 'stylus'])
            }
            return {
                test: reg_extType,
                loader: generateLoaders(_extType)
            };
        })(_config);

        _plugins.push(_extractCSS);
        /*
        生成依赖
         */
        _dependencies = _.concat(((type)=>{
            let _deps = [];
            let _loaders = EXT_MAP[type];
            let _reg=/\?/;
            _deps = _loaders.map(function(loader){
                if(_reg.test(loader)){
                    loader = loader.split(_reg)[0];
                }
                return loader+'-loader';
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
