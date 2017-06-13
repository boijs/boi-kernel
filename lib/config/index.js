'use strict';

require('shelljs/global');

const _ = require('lodash');
const Log = require('../utils').log;
const Envs = require('../constants').env;
const Plugin = require('../constants').plugin;
const Configuration = require('../constants').config;
const GenerateConfig = require('./generateConfig');
const InstallDependencies = require('boi-aux-autoinstall');


// 合法的env正则
const Reg_valid_env = new RegExp('^(' + _.values(Envs).join('|') + ')$');
// 合法的plugin可配置项正则
const Reg_valid_plugin_pattern = new RegExp('^(' + _.values(Plugin.patterns).join(
  '|') + ')$');
// 合法的config可配置项正则
const Reg_valid_config_pattern = new RegExp('^(' + _.values(Configuration.patterns)
  .join('|') + ')$');

let boiConfig = Object.assign({}, Configuration.default);
let webpackConfig = null;

/**
 * @module 配置模块
 */
const ConfigAPI = module.exports = {};

/**
 * @desc 独立配置项API，递增覆盖
 * @param {String} pattern - 配置模块
 * @param {Object} options - 配置项
 */
ConfigAPI.spec = function (pattern, options) {
  if (!pattern || !Reg_valid_config_pattern.test(pattern) || !_.isPlainObject(
      options)) {
    Log.error(`Invalid configuration pattern: ${pattern}`);
    process.exit(1);
  }

  const CurrentEnv = process.env.BOI_ENV;
  let conf = null;

  // 如果配置了合法的环境变量则读取指定配置项
  if (CurrentEnv && Reg_valid_env.test(CurrentEnv)) {
    let _keys = Object.keys(options);
    if (_keys.indexOf(CurrentEnv) === -1) {
      // 如果配置项中无环境特定配置，则直接赋值
      conf = options;
    } else {
      _keys.forEach((key) => {
        // 区分配置项是特定env生效还是共用
        if (key === CurrentEnv) {
          conf = Object.assign({}, conf, options[key]);
        } else if (!Reg_valid_env.test(key)) {
          // 屏蔽非当前环境的配置项
          conf = Object.assign({}, conf, {
            [key]: options[key]
          });
        }
      });
    }
  }
  boiConfig[pattern] = Object.assign({}, boiConfig[pattern], conf);
};

/**
 * @desc 提供给boi自定义loader类型插件使用的配置项API
 * @param {String} mode - 插件工作模式
 * @param {Object} options - loader配置项
 */
ConfigAPI.specPluginLoader = function (pattern, options) {
  // 非法插件报错
  if (!pattern || !_.isString(pattern) || !Reg_valid_plugin_pattern.test(
      pattern) || !options ||
    !_.isPlainObject(options)) {
    Log.error('Invalid plugin!');
    process.exit(1);
  }
  // 初始化相关配置
  boiConfig.pluginConfig = boiConfig.pluginConfig || [];
  boiConfig.pluginPatterns = boiConfig.pluginPatterns || [];

  boiConfig.pluginPatterns.push(pattern);
  boiConfig.pluginConfig.push(options);
};

/**
 * @desc 直接配置webpack，此配置项将会覆盖所有由{@link ConfigAPI.spec}指定的配置项，请谨慎使用
 * @param {Object} options webpack配置项
 */
ConfigAPI.specWebpackConfig = function (options) {
  webpackConfig = options || null;
};

/**
 * @desc 生成webpack配置项并自动安装依赖
 * @return {Object} webpack配置项
 */
ConfigAPI.generateWebpackConfig = function () {
  // 如果由{@link ConfigAPI.specWebpackConfig}配置webpack则直接返回
  if (webpackConfig) {
    return webpackConfig;
  }
  const Config = GenerateConfig(boiConfig);

  InstallDependencies({
    modules: Config.dependencies,
    autoCheck: boiConfig.basic.checkDependencies
  });
  return Config.webpack;
};

/**
 * @desc 获取boiConfig
 * @return {Object} boiConfig - boi配置项集合
 */
ConfigAPI.getBoiConfig = function () {
  return boiConfig;
};
