'use strict'

// node modules
let glob = require('glob');
let path = require('path');

// webpack plugins
let webpack = require('webpack');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

// fn
let fn_genEntry = require('./fn/fn.genEntry.js');
let fn_genOutput = require('./fn/fn.genOutput.js');
let fn_genModuleAndPlugin = require('./fn/fn.genMP');

/**
 * @param config {Object} - 用户配置项
 */
module.exports = function(config) {
    let _entry = null,
        _output = null,
        _module = null,
        _plugins = null,
        _resolve = null;

    let _moduleAndPlugins = null;

    _entry = fn_genEntry(config);
    _output = fn_genOutput(config);

    _moduleAndPlugins = fn_genModuleAndPlugin(config);

    _module = _moduleAndPlugins.module;
    _plugins = _moduleAndPlugins.plugins;
    console.log(path.resolve(__dirname, '../../../node_modules'))
        // 必须配置resolve，否则不能使用boli-kernel的node_modules
    _resolve = {
        root: [
            path.resolve(__dirname, '../../../node_modules')
        ]
    }
    return Object.assign({}, {
        entry: _entry,
        output: _output,
        module: _module,
        plugins: _plugins,
        resolve: _resolve
    });
}
