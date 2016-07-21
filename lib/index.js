'use strict'

let _config = require('./api/config');
let _plugin = require('./api/plugin');
let _devServer = require('./server');
let _optimize = require('./optimize');

let configApi = _config.api;
let configuration = _config.configuration;

let boi = module.exports = {};

/************ 配置 API *************/
boi.all = configApi.all;
// 单模块配置API
boi.spec = configApi.spec;
// 执行构建
boi.runBuild = configApi.runBuild;

/************ 插件API *************/
// plugins数组
boi.plugins = _plugin.plugins;
// 将使用插件API独立暴露
boi.use = _plugin.use;
// require插件API
boi.resolvePlugins = _plugin.resolvePlugins;
// 生成plugin的构造函数
boi.PluginClass = _plugin.classes;

/************ dev server API *************/
// 运行dev server
boi.runDevServer = _devServer.run;
// dev server配置API
boi.serve = _devServer.config;

/************ 优化相关功能 *************/
boi.cache = new _optimize.cache('file');
