// style entries
/**
 * 配置独立style文件的编译项
 */
'use strict'
// webpack plugins
let webpack = require('webpack');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

let path = require('path');

const STYLELOADERS = {
    css: 'css',
    less: 'less',
    scss: 'sass'
};

module.exports = function(conf) {
    let _styleLoader = null;
    let _entry = null,
        _loader = null;
    let __conf = conf.style;
    let _styleDir = path.resolve(process.cwd(), conf.src.dirname, __conf.dirname);
    let _ext = __conf.ext || 'css';

    let _extractCSS = null;

    // 如果详细配置入口文件，则只针对已配置的文件进行构建
    // 如果没有详细配置入口文件，则默认遍历指定style文件目录和子目录中所有以main.*.{_ext}命名的文件
    if (__conf.main && _.isPureObject(__conf.main)) {
        let _entryArr = [];
        for (let _file in __conf.main) {
            _entryArr.push(_file);
        }
        _entry = new RegExp('main\\.(' + _entryArr.join('|') + ')\\.' + _ext + '$');
    } else {
        _entry = new RegExp('main\\.\\w+\\.' + _ext + '$');
    }
    // style loader
    // 用户可以自行配置loaders，如果不自行配置则根据配置项自动生成
    _loader = __conf.loaders || ((opts) => {
        let _destDir = path.resolve(process.cwd(), conf.dest.dirname, opts.dirname);
        _extractCSS = new ExtractTextPlugin(_destDir + '/[name].[contenthash].min.css', {
            allChunks: false
        });
        let _extLoader = _extractCSS.extract(['css?minimize', STYLELOADERS[opts.ext]]);
        return _extLoader;
    })(__conf);

    _styleLoader = Object.assign({}, {
        test: _entry,
        loader: _loader
    });

    console.log(_styleLoader);
    return {
        loader: _styleLoader,
        plugin: _extractCSS
    };
}
