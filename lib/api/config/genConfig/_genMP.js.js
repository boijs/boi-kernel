'use strict'

let path = require('path');
let _ = require('../../../utils/index.js');

module.exports = function(config) {
    let _preloader = null,
        _loader = null,
        _postloader = null,
        _plugins = [],
        _noParse = [
            'require',
            '$',
            'exports',
            'module.exports',
            'define'
        ];

    let _dependencies = [];


    let _config = config.js;

    if (!_config) {
        return;
    }

    if(_config.uglify){
        let webpack = require('webpack');
        _plugins.push(new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: true
            },
            sourceMap: false,
            mangle: {
                except: ['$', 'exports', 'require']
            }
        }));
    }
    // 文件类型
    let _extType = _config.extType || 'js';

    let reg_extType = _.isPureArray(_extType) ? new RegExp('\\.(' + _extType.join('|') + ')$') : new RegExp('\\.' +
        _extType + '$');

    // 如果用户配置了webpack loader，则沿袭用户的配置
    if (_config.webpackConfig) {
        // preloader
        _preloader = _.assign(_config.webpackConfig.preloader) || null;
        // loader
        _loader = _.assign(_config.webpackConfig.loader) || null;
        // postloader
        _postloader = _.assign(_config.webpackConfig.postloader) || null;
    }
    // 如果loader为空，则使用默认loader
    // 默认loader只包含支持es2015语法的babel-loader
    if (!_loader) {
        let _exclude = [
            /node_modules/,
            path.join(__dirname,'assist')
        ];
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
                        'stage-0',
                        'es2015'
                    ],
                    plugins: [
                        "transform-object-assign",
                        "syntax-object-rest-spread"
                    ]
                }
            });
        })(_config);
        _dependencies = _dependencies.concat([
            'babel-loader',
            'babel-preset-stage-0',
            'babel-preset-es2015',
            'babel-plugin-transform-object-assign',
            'babel-plugin-syntax-object-rest-spread'
        ]);
    }
    return {
        preloader: _preloader,
        postloader: _postloader,
        loader: _loader,
        plugins: _plugins,
        noParse: _noParse,
        dependencies: _dependencies
    };
};
