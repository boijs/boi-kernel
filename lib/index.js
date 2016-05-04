'use strict'

let config = require('./api/config');
let plugin = require('./api/plugin');

let boi = module.exports = {};

/************ 配置 API *************/
// boi.config = config;
// 单模块配置API
boi.spec = config.spec;
// 执行构建
boi.runBuild = config.runBuild;

/************ 插件API *************/
// plugins数组
boi.plugins = plugin.plugins;
// 将使用插件API独立暴露
boi.use = plugin.use;
// require插件API
boi.resolvePlugins = plugin.resolvePlugins;
// 生成plugin的构造函数
boi.PluginClass = plugin.classes;
