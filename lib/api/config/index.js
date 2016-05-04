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

let genWebpackConf = require('./genWebpackConf.js');

let _ = require('../../utils/index.js');

const CONFIG = require('../../constants').config;
const PLUGIN = require('../../constants').plugin;
// 可配置项
const AVAILABLE_CONFIG_PATTERNS = CONFIG.available_patterns;
const DEFAULT_CONFIG = CONFIG.default_config;
// 插件可配置项
const AVAILABLE_PLUGIN_PATTERNS = PLUGIN.available_patterns;

let _conf = null;

// 判断是否是可用的配置项
function isValidPattern(pattern, legalPatterns) {
    return legalPatterns.indexOf(pattern) !== -1;
}

let config = module.exports = function(conf) {
    if (!conf || !_.isPureObject(conf)) {
        return;
    }
    _conf = Object.assign({}, DEFAULT_CONFIG, conf);
};
/**
 * 独立配置项API，递增覆盖
 * @param {string} pattern - 配置模块
 * @param {object} options - 配置项
 */
config.spec = function(pattern, options) {
    if (!pattern || !_.isPureString(pattern) || !isValidPattern(pattern, AVAILABLE_CONFIG_PATTERNS) || !options ||
        !_.isPureObject(options)) {
        console.log(colors.red('Invalid configuration!'));
        return;
    }
    if (!_conf) {
        _conf = Object.assign({}, DEFAULT_CONFIG);
    }
    // 覆盖同名配置项
    let __conf = {};
    __conf[pattern] = Object.assign({}, _conf[pattern], options);
    _conf = Object.assign({}, _conf, __conf);
};
/**
 * 提供给boi自定义loader类型插件使用的配置项API
 * @param {string} mode - 插件工作模式
 * @param {object} options - loader配置项
 */
config.specPluginLoader = function(pattern, options) {
    if (!pattern || !_.isPureString(pattern) || !isValidPattern(pattern, AVAILABLE_PLUGIN_PATTERNS) || !options ||
        !
        _.isPureObject(options)) {
        console.log(colors.red('Invalid plugin!'));
        return;
    }
    if (!_conf) {
        _conf = Object.assign({}, DEFAULT_CONFIG);
    }
    if (!_conf.extraLoaders) {
        _conf.extraLoaders = [];
    }
    if (!_conf.pluginPatterns) {
        _conf.pluginPatterns = [];
    }
    _conf.pluginPatterns.push(pattern);
    _conf.extraLoaders.push(options);
}

/**
 * 联合配置项API，清空原有配置项，并用新配置项替代
 * @todo
 * @param {Array} srcPatterns - 原有的配置模块数组，此数组中的模块配置项将被完全清空
 * @param {Array} targetPattern - 新配置模块
 * @param {Object} options - 新模块配置项
 */
config.combine = function(srcPatterns, targetPattern, options) {
    if (!_conf) {
        _conf = Object.assign({}, DEFAULT_CONFIG);
    }
    if (!srcPatterns || !_.isPureArray(srcPatterns) || !targetPattern || !_.isPureString(targetPattern) || !options ||
        !_.isPureObject(
            options)) {
        console.log(colors.red('Invalid configuration!'));
        return;
    }
    srcPatterns.forEach(function(pattern) {
        if (isValidPattern(pattern)) {
            // 同名配置模块被清空
            _conf[pattern] = null;
        }
    });
}

/**
 * 生成webpack配置文件并执行webpack任务
 */
config.runBuild = function() {
    let webpackConfig = genWebpackConf(_conf);
    webpack(webpackConfig).run(function(err, stat) {
        if (stat.toJson().errors.length !== 0) {
            throw new Error(stat.toJson().errors);
        }
        console.log(colors.blue('Built successfully!'));
    });
};
