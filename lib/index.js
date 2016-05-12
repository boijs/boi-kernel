'use strict'

let api_config = require('./api/config');
let api_plugin = require('./api/plugin');
let api_devServer = require('./server');
let api_optimize = require('./optimize');

let configApi = api_config.api;
let configuration = api_config.configuration;

let boi = module.exports = {};

/************ 配置 API *************/
boi.all = configApi.all;
// 单模块配置API
boi.spec = configApi.spec;
// 执行构建
boi.runBuild = configApi.runBuild;

/************ 插件API *************/
// plugins数组
boi.plugins = api_plugin.plugins;
// 将使用插件API独立暴露
boi.use = api_plugin.use;
// require插件API
boi.resolvePlugins = api_plugin.resolvePlugins;
// 生成plugin的构造函数
boi.PluginClass = api_plugin.classes;

/************ dev server API *************/
// 运行dev server
boi.runDevServer = api_devServer.run;
// dev server配置API
boi.server = api_devServer.config;

/************ 优化相关功能 *************/
