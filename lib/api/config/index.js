/**
 * @desc 配置功能
 */
'use strict'

let path = require('path');
let fs = require('fs');
let util = require('util');
// thirdparty tools
let colors = require('colors/safe');
let Promise = require('bluebird');
// webpack plugins
let webpack = require('webpack');

let UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
let CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin;

let generateEntries = require('./config.generateEntries.js');
let generateOutput = require('./config.generateOutput.js');
let generateModuleAndPlugins = require('./config.generateModuleAndPlugins.js');

const DEFAULT_CONFIG = require('./config.default.js');
const _ = require('../utils/index.js');

// 可配置项
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
    if (!pattern || !_.isPureString(pattern) || !options || !_.isPureObject(
            options)) {
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
    let webpackConfig = null;
    let _entries = generateEntries(_conf);
    // console.log(_entries);
    let _output = generateOutput(_conf);
    // console.log(_output);
    let _moduleAndPlugins = generateModuleAndPlugins(_conf);

    webpackConfig = Object.assign({}, {
        entry: _entries,
        output: _output,
        module: _moduleAndPlugins.module,
        plugins: _moduleAndPlugins.plugins
    });

    let _confFilePath = path.resolve(__dirname, '../../conf');

    Promise.try(function() {
        return fs.readdirSync(_confFilePath);
    }).catch(function(err) {
        fs.mkdirSync(_confFilePath);
    }).then(function() {
        return fs.openSync(path.resolve(_confFilePath, './webpack.config.js'), 'w+');
    }).then(function(fd) {
        fs.writeFileSync(fd, util.inspect(webpackConfig), 'utf-8');
    });
};
