'use strict';

require('shelljs/global');

const _ = require('lodash');
const GenerateConfig = require('./generateConfig');
const InstallDependencies = require('boi-aux-autoinstall');
const Configuration = require('../constants').config;
const Plugin = require('../constants').plugin;
const Envs = require('../constants').env;
const Log = require('../utils').log;

// 合法的env正则
const Reg_valid_env = new RegExp('^(' + _.values(Envs).join('|') + ')$');
// 合法的plugin可配置项正则
const Reg_valid_plugin_pattern = new RegExp('^(' + _.values(Plugin.patterns).join('|') + ')$');
// 合法的config可配置项正则
const Reg_valid_config_pattern = new RegExp('^(' + _.values(Configuration.patterns).join('|') +
  ')$');

let api = module.exports = {};
let boiConfig = Object.assign({}, Configuration.default);

/**
 * @desc 统一配置入口
 * @param {Object} options - 配置项
 */
api.specAll = (options) => {
  if (!options || !_.isPlainObject(options)) {
    return;
  }
  boiConfig = Object.assign(boiConfig, options);
};

/**
 * @desc 独立配置项API，递增覆盖
 * @param {String} pattern - 配置模块
 * @param {Object} options - 配置项
 */
api.spec = (pattern, options) => {
  if (!pattern || !_.isString(pattern) || !Reg_valid_config_pattern.test(pattern) || !options ||
    !_.isPlainObject(options)) {
    Log.error(`Invalid configuration pattern: ${pattern}`);
    process.exit(1);
  }

  let _options = null;
  let _env = process.env.BOI_ENV;

  // 判断env是否合法
  if (Reg_valid_env.test(_env)) {
    let _keys = Object.keys(options);
    if (_keys.indexOf(_env) === -1) {
      // 如果配置项中无环境特定配置，则直接赋值
      _options = options;
    } else {
      _keys.forEach((key) => {
        // 区分配置项是特定env生效还是共用
        if (key === _env) {
          _options = Object.assign({}, _options, options[key]);
        } else if (!Reg_valid_env.test(key)) {
          // 屏蔽非当前环境的配置项
          _options = Object.assign({}, _options, {
            [key]: options[key]
          });
        }
      });
    }
  }
  boiConfig = Object.assign({}, boiConfig, {
    [pattern]: Object.assign({}, boiConfig[pattern], _options)
  });
};

/**
 * @desc 提供给boi自定义loader类型插件使用的配置项API
 * @param {String} mode - 插件工作模式
 * @param {Object} options - loader配置项
 */
api.specPluginLoader = (pattern, options) => {
  if (!pattern || !_.isString(pattern) || !Reg_valid_plugin_pattern.test(pattern) || !options ||
    !_.isPlainObject(options)) {
    Log.error('Invalid plugin!');
    return;
  }
  if (!boiConfig.extraLoaders) {
    boiConfig.extraLoaders = [];
  }
  if (!boiConfig.pluginPatterns) {
    boiConfig.pluginPatterns = [];
  }
  boiConfig.pluginPatterns.push(pattern);
  boiConfig.extraLoaders.push(options);
};

/**
 * @todo 联合配置项API，清空原有配置项，并用新配置项替代
 * @param {Array} srcPatterns - 原有的配置模块数组，此数组中的模块配置项将被完全清空
 * @param {Array} targetPattern - 新配置模块
 * @param {Object} options - 新模块配置项
 */
// api.combine = (srcPatterns, targetPattern, options) => {};

/**
 * @todo 直接配置webpack api
 */
// api.directWP = (options) => {};


/**
 * @desc 生成webpack配置项并自动安装依赖
 * @return {Object} webpack配置项
 */
api.generateWebpackConfig = () => {
  let _config = GenerateConfig(boiConfig);

  InstallDependencies({
    modules: _config.dependencies,
    autoCheck: boiConfig.basic.checkDependencies
  });
  return _config.wp;
};
/**
 * @desc 获取boiConfig
 * @return {Object} boiConfig - boi配置项集合
 */
api.getBoiConfig = () => {
  return boiConfig;
};
