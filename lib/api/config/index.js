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

const _ = require('../../utils/index.js');

// 可配置项
const AVAILABLE_PATTERNS = require('../../constants').config.available_patterns;
const DEFAULT_CONFIG = require('../../constants').config.default_config;

let _conf = null;

// 判断是否是可用的配置项
function isValidPattern(pattern) {
    return AVAILABLE_PATTERNS.indexOf(pattern) !== -1;
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
 * 提供给boi自定义loader类型插件使用的配置项API
 * @param {string} mode - 插件工作模式
 * @param {object} options - loader配置项
 */
config.specExtraLoader = function(mode, options) {
    if (!_conf) {
        _conf = Object.assign({}, DEFAULT_CONFIG);
    }
    if (!_conf.extraLoaders) {
        _conf.extraLoaders = [];
    }
    _conf.extraLoaders.push(options);
}

/**
 * 联合配置项API，完全覆盖
 * @deprecated
 * @param {Array} patterns - 配置模块的数组，此数组中的配置模块被完全覆盖
 * @param {Object} options - 配置项
 */
// config.combine = function(patterns, options) {
//     if (!_conf) {
//         _conf = Object.assign({}, DEFAULT_CONFIG);
//     }
//     if (!patterns || !_.isPureArray(patterns) || !options || !_.isPureObject(
//             options)) {
//         console.log(colors.red('Invalid configuration!'));
//         return;
//     }
//     patterns.forEach(function(v, i) {
//         if (isValidPattern(v)) {
//             // 同名配置模块被完全覆盖
//             _conf[v] = null;
//         }
//     });
// }

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
