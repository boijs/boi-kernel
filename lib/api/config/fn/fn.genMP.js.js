'use strict'

let _ = require('../../utils/index.js');

module.exports = function(config) {
    let _preloader = null,
        _loader = null,
        _postloader = null;
    let _plugins = [];
    // 文件类型
    let _extType = config.extType || 'js';

    let reg_extType = _.isPureArray(_extType) ? new RegExp('\\.(' + _extType.join('|') + ')$') : new RegExp('\\.' +
        _extType + '$');

    // 如果用户配置了webpack loader，则沿袭用户的配置
    if (config.webpackConfig) {
        // preloader
        _preloader = (config.webpackConfig.preloader && ((options) => {
            // 如果loader没有配置则返回null
            if (!options.loader) {
                return null;
            }
            return Object.assign({}, {
                test: options.test || reg_extType,
                loader: options.loader,
                query: options.query || null
            });
        })(config.webpackConfig.preloader)) || null;
        // postloader
        _postloader = (config.webpackConfig.postloader && ((options) => {
            if (!options.loader) {
                return null;
            }
            return Object.assign({}, {
                test: options.test || reg_extType,
                loader: options.loader,
                query: options.query || null
            });
        })(config.webpackConfig.postloader)) || null;

        _loader = (config.webpackConfig.loader && ((options) => {
            if (!options.loader) {
                return null;
            }
            return Object.assign({}, {
                test: options.test || reg_extType,
                loader: options.loader,
                query: options.query || null
            });
        })(config.webpackConfig.loader)) || null;
    }
    // 如果loader为空，则使用默认loader
    // 默认loader只包含支持es2015语法的babel-loader
    if (!_loader) {
        _loader = ((options) => {
            return Object.assign({}, {
                test: reg_extType,
                exclude: [/node_modules/],
                loader: 'babel',
                query: {
                    presets: [
                        require('babel-preset-es2015')
                    ],
                    cacheDirectory: true,
                    plugins: ['syntax-object-rest-spread']
                }
            });
        })(config);
    }
    return {
        preloader: _preloader,
        postloader: _postloader,
        loader: _loader,
        plugins: _plugins
    };
};
