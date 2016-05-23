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

// 判断是否是可用的配置项
function isValidPattern(pattern, legalPatterns) {
    return legalPatterns.indexOf(pattern) !== -1;
}

// 用户配置集合对象
let boiConfig = null;

// webpack配置项
let webpackConfig = null;
// api集合
let api = {};

/**
 * 统一配置入口
 * @param {object} conf - 配置项
 */
api.all = function(conf) {
    if (!conf || !_.isPureObject(conf)) {
        return;
    }
    boiConfig = Object.assign({}, DEFAULT_CONFIG, conf);
};
/**
 * 独立配置项API，递增覆盖
 * @param {string} pattern - 配置模块
 * @param {object} options - 配置项
 */
api.spec = function(pattern, options) {
    if (!pattern || !_.isPureString(pattern) || !isValidPattern(pattern, AVAILABLE_CONFIG_PATTERNS) || !options ||
        !_.isPureObject(options)) {
        console.log(colors.red('Invalid configuration!'));
        return;
    }
    if (!boiConfig) {
        boiConfig = Object.assign({}, DEFAULT_CONFIG);
    }
    // 覆盖同名配置项
    let __conf = {};
    __conf[pattern] = Object.assign({}, boiConfig[pattern], options);
    boiConfig = Object.assign({}, boiConfig, __conf);
};
/**
 * 提供给boi自定义loader类型插件使用的配置项API
 * @param {string} mode - 插件工作模式
 * @param {object} options - loader配置项
 */
api.specPluginLoader = function(pattern, options) {
    if (!pattern || !_.isPureString(pattern) || !isValidPattern(pattern, AVAILABLE_PLUGIN_PATTERNS) || !options ||
        !
        _.isPureObject(options)) {
        console.log(colors.red('Invalid plugin!'));
        return;
    }
    if (!boiConfig) {
        boiConfig = Object.assign({}, DEFAULT_CONFIG);
    }
    if (!boiConfig.extraLoaders) {
        boiConfig.extraLoaders = [];
    }
    if (!boiConfig.pluginPatterns) {
        boiConfig.pluginPatterns = [];
    }
    boiConfig.pluginPatterns.push(pattern);
    boiConfig.extraLoaders.push(options);
}

/**
 * 联合配置项API，清空原有配置项，并用新配置项替代
 * @todo
 * @param {Array} srcPatterns - 原有的配置模块数组，此数组中的模块配置项将被完全清空
 * @param {Array} targetPattern - 新配置模块
 * @param {Object} options - 新模块配置项
 */
api.combine = function(srcPatterns, targetPattern, options) {
    if (!boiConfig) {
        boiConfig = Object.assign({}, DEFAULT_CONFIG);
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
            boiConfig[pattern] = null;
        }
    });
}

/**
 * 生成webpack配置文件并执行webpack任务
 * @param {String} env - 编译环境
 */
api.runBuild = function(env) {
    // 默认dev环境编译
    let _env = env || 'dev';
    webpackConfig = genWebpackConf(boiConfig, _env);

    webpack(webpackConfig).run(function(err, stat) {
        if (err) {
            throw err;
        }
        if (stat.toJson().errors.length !== 0) {
            throw new Error(stat.toJson().errors);
        }
        // log构建结果
        process.stdout.write(stat.toString({
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false
        }) + '\n');
        console.log(colors.blue('Done!'));
        process.exit();
    });
};
/**
 * 生成dev环境的webpack配置项
 */
api.genDevConfig = function() {
    return webpackConfig || genWebpackConf(boiConfig, 'dev');
};
/**
 * 获取boiConfig
 */
api.getBoiConfig = function() {
    return boiConfig;
};

module.exports = {
    webpackConfig,
    api
};
