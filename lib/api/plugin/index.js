'use strict'

let fs = require('fs');
let path = require('path');
let _ = require('lodash');
let ora = require('ora');
require('shelljs/global');

let plugin = module.exports = {};

let spinner = ora();
spinner.color = 'blue';

plugin.plugins = [];

/**
 * 使用插件API，暴露给用户配置
 */
plugin.use = function(pluginModule,options) {
    // 将插件名称保存
    // plugin.plugins.push(pluginModule);
    plugin.plugins.push({
        name: pluginModule,
        options: options
    })

    // 自定义插件用户可以自行安装
    // 如果用户没有安装，则自动安装依赖插件
    try {
        // require.resolve只会判断模块是否存在，不会加载插件
        require.resolve(path.resolve(process.cwd(), 'node_modules', pluginModule));
    } catch (e) {
        spinner.text = 'Install ' + pluginModule + '......\n';
        spinner.start();
        exec('npm install ' + pluginModule + ' --save-dev');
    }
    spinner.text = 'Install ' + pluginModule + '..... Done!\n';
    spinner.stop();
};
/**
 * 引入插件模块
 */
plugin.resolvePlugins = function() {
    if (plugin.plugins && plugin.plugins.length !== 0) {
        plugin.plugins.forEach(function(plugin) {
            let _plugin = require(path.resolve(process.cwd(), 'node_modules', plugin.name));
            if(_.isFunction(_plugin)){
                _plugin(plugin.options);
            }
        });
    }
    return false;
};

// loader类型的plugin
plugin.classes = require('./classes');
