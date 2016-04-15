/**
 * @desc 配置功能
 */
'use strict'

let path = require('path');
// thirdparty tools
let glob = require('glob');
let colors = require('colors/safe');
let Promise = require('bluebird');
// webpack plugins
// let ExtractTextPlugin = require('extract-text-webpack-plugin')
// let UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
// let CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin

const DEFAULT_CONFIG = require('./config.default.js');
const _ = require('../utils/index.js');

const PATTERNS = [
    'src',
    'dest',
    'deploy',
    'js',
    'css',
    'image',
    'tpl'
];

let _conf = null;

// 判断是否是可用的配置项
function isValidPattern(pattern) {
    return !!PATTERNS.indexOf(pattern);
}

let config = module.exports = function(conf) {
    if (!conf || !_.isPureObject(conf)) {
        return;
    }
    _conf = Object.assign({}, DEFAULT_CONFIG, conf);
};
/**
 * 细化配置项API
 * @param {string} pattern - 配置模块
 * @param {object} options - 配置项
 */
config.spec = function(pattern, options) {
    if (!_conf) {
        _conf = Object.assign({}, DEFAULT_CONFIG);
    }
    if (!pattern || !_.isPureString(pattern) || !options || !_.isPureObject(options)) {
        console.log(colors.red('Invalid configuration!'));
        return;
    }
    if (isValidPattern(pattern)) {
        // 覆盖同名配置项
        let __conf = {};
        __conf[pattern] = Object.assign({}, _conf[pattern], options);
        _conf = Object.assign({}, _conf, __conf);
    }
};
/**
 * 生成webpack配置文件
 */
config.generateConfFile = function() {
    let _entries = generateEntries();
    // console.log(_entries);
    let _output = generateOutput();
    // console.log(_output);
    let _moduleAndPlugins = generateModuleAndPlugins();
};

// 生成entry（打包入口文件）配置
function generateEntries() {
    let _entries = {};
    let _jsDir = path.resolve(process.cwd(), _conf.src.dirname, _conf.js.dirname);
    let _ext = _conf.js.ext || 'js';

    const REG_MAIN_FULL = new RegExp('main\\.\\w+\\.' + _ext + '$');
    const REG_MAIN_NAME = /^main\.\w+/;
    // 如果详细配置入口文件，则只针对已配置的文件进行构建
    // 如果没有详细配置入口文件，则默认遍历指定js文件目录和子目录中所有以main.*.js命名的文件
    if (_conf.js.main && _.isPureObject(_conf.js.main)) {
        for (let filename in _conf.js.main) {
            _entries[filename] = path.join(_jsDir, _conf.js.main[filename] + '.' + _ext);
        }
    } else {
        // 遍历子目录
        let _jsEntries = glob.sync(_jsDir + '/**/main.*.' + _ext);
        _jsEntries.forEach((filePath) => {
            let _filename = REG_MAIN_NAME.exec(REG_MAIN_FULL.exec(filePath));
            _entries[_filename] = filePath;
        });
    }
    return _entries;
}

// 生成output（本地）配置
function generateOutput() {
    let _output = null;
    let _path = path.resolve(process.cwd(), _conf.dest.dirname);
    let _filename = '[name].[hash:8].min.js';

    _output = Object.assign({}, {
        path: _path,
        filename: _filename
    });
    return _output;
}
// 生成module loader和plugins配置项
function generateModuleAndPlugins() {
    let _result = null,
        _module = null,
        _plugins = null;
    let _loaders = null,
        _loader_image = null,
        _loader_js = null;
    // image loader
    // 用户可以自行配置loaders，如果不自行配置则根据配置项生成
    _loader_image = _conf.image || ((opts) => {
        let __test = /\.((woff2?|svg)(\?v=[0-9]\.[0-9]\.[0-9]))|(woff2?|svg|jpe?g|png|gif|ico)$/;
        let __loaders = [];
        if (opts.base64) {
            __loaders.push('url?limit=' + (opts.base64Limit | '10000') + '&name=img/[name].[hash:8].[ext]');
        }
        __loaders.push('image?{bypassOnDebug:true, progressive:true,optimizationLevel:3,pngquant:{quality:"65-80",speed:4}}');
        return {
            test: __test,
            loaders: __loaders
        }
    })(_conf.image);

    // js loader
    // 用户可以自行配置loaders，如果不自行配置则根据transfer的配置项生成
    _loader_js = (_conf.js.transfer && _conf.js.transfer.loaders) || ((opts) => {
        console.log(opts);
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
    })(_conf.js.transfer);
    console.log(_loader_js);

    // if (_conf.js.transfer && _conf.js.transfer.loaders) {
    //     _loader_js = _conf.js.transfer.loaders;
    // } else {
    //     _loader_js = {
    //         test: /\.(jsx?|es)$/,
    //         exclude: [/node_modules/]
    //     };
    //     if (_conf.js.transfer && _conf.js.transfer.isTransfer) {
    //         let _srcType = _conf.transfer.srcType.join('|')
    //         let _presets = [];
    //         // 默认使用babel stage-0
    //         _presets.push('stage-0');
    //         if (/(es2015|es6)/.test(_srcType)) {
    //             _presets.push('es2015');
    //         }
    //         if (/react/.test(_srcType)) {
    //             _presets.push('react');
    //         };
    //         _loader_js = Object.assign({}, _loader_js, {
    //             loader: 'babel',
    //             query: {
    //                 presets: _presets,
    //                 cacheDirectory: true,
    //                 plugins: ['syntax-object-rest-spread']
    //             }
    //         })
    //     }
    // }


}