'use strict'

// node modules
let glob = require('glob');
let path = require('path');

// webpack plugins
let webpack = require('webpack');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

/**
 * @param config {Object} - 用户配置项
 */
module.exports = function(config) {
    // 配置entry
    let entry = ((conf) => {
        let _entry = {};
        let _jsDir = path.resolve(process.cwd(), conf.src.dirname, conf.js.dirname);
        let _ext = conf.js.ext || 'js';

        const REG_MAIN_FULL = new RegExp('main\\.\\w+\\.' + _ext + '$');
        const REG_MAIN_NAME = /^main\.\w+/;

        // 如果详细配置入口文件，则只针对已配置的文件进行构建
        // 如果没有详细配置入口文件，则默认遍历指定js文件目录和子目录中所有以main.*.js命名的文件
        if (conf.js.main && _.isPureObject(conf.js.main)) {
            for (let filename in conf.js.main) {
                _entry[filename] = path.join(_jsDir, conf.js.main[filename] +
                    '.' + _ext);
            }
        } else {
            // 遍历子目录
            let _jsEntries = glob.sync(_jsDir + '/**/main.*.' + _ext);
            _jsEntries.forEach((filePath) => {
                let _filename = REG_MAIN_NAME.exec(REG_MAIN_FULL.exec(
                    filePath));
                _entry[_filename] = filePath;
            });
        }
        return _entry;
    })(config);

    // 配置output
    let output = ((conf) => {
        let _output = null;
        let _path = path.resolve(process.cwd(), conf.dest.dirname, conf.js.dirname);
        let _filename = '[name].[hash:8].min.js';

        _output = Object.assign({}, {
            path: _path,
            filename: _filename
        });
        return _output;
    })(config);

    // image loader
    // 用户可以自行配置loaders，如果不自行配置则根据配置项生成
    let _loader_image = config.image.loader || ((opts) => {
        let __test =
            /\.((woff2?|svg)(\?v=[0-9]\.[0-9]\.[0-9]))|(woff2?|svg|jpe?g|png|gif|ico)$/;
        let __loaders = [];
        if (opts.base64) {
            __loaders.push('url?limit=' + (opts.base64Limit | '10000') +
                '&name=img/[name].[hash:8].[ext]');
        }
        __loaders.push(
            'image?{bypassOnDebug:true, progressive:true,optimizationLevel:3,pngquant:{quality:"65-80",speed:4}}'
        );
        return Object.assign({}, {
            test: __test,
            loaders: __loaders
        });
    })(config.image);
    // js loader
    // 用户可以自行配置loaders，如果不自行配置则根据transfer的配置项生成
    let _loader_js = (config.js.transfer && config.js.transfer.loaders) || ((opts) => {
        if (!opts) {
            return null;
        }
        let _srcType = opts.srcType.join('|');
        let _presets = [];
        // 默认使用babel stage-0
        _presets.push('stage-0');
        if (/(es2015|es6)/.test(_srcType)) {
            _presets.push('es2015');
        }
        if (/react/.test(_srcType)) {
            _presets.push('react');
        };
        return Object.assign({}, {
            test: /\.(jsx?|es)$/,
            exclude: [/node_modules/]
        }, {
            loader: 'babel',
            query: {
                presets: _presets,
                cacheDirectory: true,
                plugins: ['syntax-object-rest-spread']
            }
        });
    })(config.js.transfer);
    // console.log(_loader_js)
}
