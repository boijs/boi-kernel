'use strict'

let _config = require('./config');
let _plugin = require('./plugin');
let _devServer = require('./server');
let _optimize = require('./optimize');
// let _deploy = require('./deploy');

let boi = module.exports = {};

/************ 配置 API *************/
boi.all = _config.all;
// 单模块配置API
boi.spec = _config.spec;
// 执行构建
boi.runBuild = _config.runBuild;

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

/************ 部署API *************/
// 配置API
// boi.deploy = _deploy.config;
// 执行部署
// boi.runDeploy = _deploy.run;
