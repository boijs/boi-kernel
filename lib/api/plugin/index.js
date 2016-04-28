'use strict'

require('shelljs/global');

let fs = require('fs');
let path = require('path');
let colors = require('colors');
let plugin = module.exports = {};

plugin.plugins = [];

plugin.use = function(pluginModule) {
    // use API只将插件名称保存，不执行require操作
    plugin.plugins.push(pluginModule);
    console.log(colors.blue('Install ' + pluginModule + '......\n'));
    try {
        require.resolve(path.resolve(process.cwd(), 'node_modules', pluginModule));
    } catch (e) {
        exec('npm install ' + pluginModule + ' --save-dev');
    }
    console.log(colors.blue('Install ' + pluginModule + '..... Done!\n'));
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
