'use strict'

let config = require('./api/config');
let plugin = require('./api/plugin');

let boi = module.exports = {};

// config API
boi.config = config;
boi.runBuild = config.runBuild;

// 插件API
boi.plugin = plugin;
// boi plugins数组
boi.plugins = plugin.plugins;
// 将使用插件API独立暴露
boi.use = plugin.use;
boi.resolvePlugins = plugin.resolvePlugins;
// loader类型的plugin
// @constructor
boi.PluginLoader = plugin.loader;
