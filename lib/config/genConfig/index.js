'use strict'

// node modules
let glob = require('glob');
let path = require('path');

// webpack plugins
let webpack = require('webpack');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

let _ = require('lodash');
// fn
let fn_genEntry = require('./_genEntry.js');
let fn_genOutput = require('./_genOutput.js');
let fn_genModuleAndPlugin = require('./_genMP.js');

/**
 * @param config {Object} - 用户配置项
 */
module.exports = function(config, env) {
    let _entry = null,
        _output = null,
        _module = null,
        _plugins = null;

    let _moduleAndPlugins = null;

    let _entryAndPlugins = fn_genEntry(config,env);
    _entry = _entryAndPlugins.entry;

    _output = fn_genOutput(config, env);

    _moduleAndPlugins = fn_genModuleAndPlugin(config, env);

    _module = _moduleAndPlugins.module;
    _plugins = _moduleAndPlugins.plugins.concat(_entryAndPlugins.plugins);

    let _extraResolvePath = ((extra) => {
        let _paths = [];
        if (!extra || extra.length === 0) {
            return _paths;
        }
        extra.forEach(function(v) {
            if (v.reslovePath && _.isString(v.reslovePath)) {
                _paths.push(path.posix.resolve(process.cwd(), 'node_modules', v.reslovePath));
            }
        });
        return _paths;
    })(config.extraLoaders);

    // 配置webpack loader的寻址路径
    // 使用nvm管理node的环境下，npm install -g的模块不能被resolve解析，这是nvm作者的个人偏好
    // @see https://github.com/creationix/nvm/pull/97
    // path.posix.resolve(__dirname, '../../../node_modules')是构建工具自身的模块目录
    // path.posix.resolve(process.cwd())是具体项目的模块目录
    let _resolveLoader = {
        root: [
            path.posix.resolve(__dirname,'../../../node_modules'),
            path.posix.resolve(process.cwd(),'node_modules')
        ],
        modulesDirectories: ["node_modules"],
        fallback: [].concat(_extraResolvePath)
    };
    // 资源文件的寻址路径配置
    // fallback必须配置，不然一些webpack loader的插件（比如babel preset）无法获得正确资源
    let _resolve = {
        modulesDirectories: ["node_modules"],
        root: [
            path.posix.resolve(__dirname,'../../../node_modules'),
            path.posix.resolve(process.cwd(),'node_modules')
        ],
        fallback: [].concat(_extraResolvePath)
    };

    return _.assign({}, {
        wp: _.assign({
            entry: _entry,
            output: _output,
            module: _module,
            plugins: _plugins,
            resolveLoader: _resolveLoader,
            resolve: _resolve,
            devtool: env === 'dev' ? 'source-map' : ''
        },_moduleAndPlugins.extras),
        dependencies: _moduleAndPlugins.dependencies
    });
}
