'use strict'

let fs = require('fs');
let path = require('path');

let ora = require('ora');
require('shelljs/global');

let plugin = module.exports = {};

let spinner = ora();
spinner.color = 'blue';

plugin.plugins = [];

plugin.use = function(pluginModule) {
    // 将插件名称保存
    plugin.plugins.push(pluginModule);

    // 自定义插件用户可以自行安装
    // 如果用户没有安装，则自动安装依赖插件
    try {
        // require.resolve只会判断模块是否存在，不会加载插件
        require.resolve(path.resolve(process.cwd(), 'node_modules', pluginModule));
    } catch (e) {
        spinner.text = 'Install ' + pluginModule + '......\n';
        spinner.start();
        // console.log(colors.blue('Install ' + pluginModule + '......\n'));
        exec('npm install ' + pluginModule + ' --save-dev');
    }
    spinner.text = 'Install ' + pluginModule + '..... Done!\n';
    spinner.stop();
    // console.log(colors.blue('Install ' + pluginModule + '..... Done!\n'));
}

plugin.resolvePlugins = function() {
    if (plugin.plugins && plugin.plugins.length !== 0) {
        plugin.plugins.forEach(function(v, i) {
            require(path.resolve(process.cwd(), 'node_modules', v));
        });
    }
    return false;
}

// loader类型的plugin
plugin.loader = require('./classes/class.plugin.loader.js');
