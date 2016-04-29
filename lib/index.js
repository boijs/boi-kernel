'use strict'

let config = require('./api/config');
let plugin = require('./api/plugin');

let boli = module.exports = {};

// config API
boli.config = config;
boli.runBuild = config.runBuild;

// 插件API
boli.plugin = plugin;
// boli plugins数组
boli.plugins = plugin.plugins;
// 将使用插件API独立暴露
boli.use = plugin.use;
boli.resolvePlugins = plugin.resolvePlugins;
// loader类型的plugin
// @constructor
boli.PluginLoader = plugin.loader;


//将boli暴露为全局变量
Object.defineProperty(global, 'boli', {
    enumerable: true,
    writable: false,
    value: boli
});
