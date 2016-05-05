'use strict'

// node modules
let glob = require('glob');
let path = require('path');

// webpack plugins
let webpack = require('webpack');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

let _ = require('../../utils');
// fn
let fn_genEntry = require('./fn/fn.genEntry.js');
let fn_genOutput = require('./fn/fn.genOutput.js');
let fn_genModuleAndPlugin = require('./fn/fn.genMP');

/**
 * @param config {Object} - 用户配置项
 */
module.exports = function(config, env) {
    let _entry = null,
        _output = null,
        _module = null,
        _plugins = null;

    let _moduleAndPlugins = null;

    _entry = fn_genEntry(config);
    _output = fn_genOutput(config);

    _moduleAndPlugins = fn_genModuleAndPlugin(config, env);

    _module = _moduleAndPlugins.module;
    _plugins = _moduleAndPlugins.plugins;

    let _extraResolvePath = ((extra) => {
        let _paths = [];
        if (!extra || extra.length === 0) {
            return _paths;
        }
        extra.forEach(function(v) {
            if (v.reslovePath && _.isPureString(v.reslovePath)) {
                _paths.push(path.resolve(process.cwd(), 'node_modules', v.reslovePath));
            }
        });
        return _paths;
    })(config.extraLoaders);

    // 配置webpack loader的寻址路径
    // path.resolve(__dirname, '../../../node_modules')是构建工具自身的模块目录
    // path.resolve(process.cwd())是具体项目的模块目录
    let _resolveLoader = {
        modulesDirectories: ["node_modules"],
        fallback: [
            path.resolve(__dirname, '../../../node_modules'),
            path.resolve(__dirname, '../../../..'),
            path.resolve(process.cwd())
        ].concat(_extraResolvePath)
    };
    // 资源文件的寻址路径配置
    // fallback必须配置，不然一些webpack loader的插件（比如babel preset）无法获得正确资源
    let _resolve = {
        modulesDirectories: ["node_modules"],
        fallback: [
            path.resolve(__dirname, '../../../node_modules'),
            path.resolve(__dirname, '../../../..'),
            path.resolve(process.cwd())
        ].concat(_extraResolvePath)
    };

    return Object.assign({}, {
        entry: _entry,
        output: _output,
        module: _module,
        plugins: _plugins,
        resolveLoader: _resolveLoader,
        resolve: _resolve,
        devtool: env === 'dev' ? 'source-map' : ''
    });
}
