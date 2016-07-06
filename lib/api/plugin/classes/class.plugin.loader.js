'use strict'

let apiConfig = require('../../../api/config').api;
let _ = require('../../../utils');
let loderpatterns = require('../../../constants').plugin.loaderpatterns;

/**
 * 配置loader的plugin构造函数
 * @constructor
 * @param {string} [pattern=extend] - 插件工作模式
 * @param {object} options - loader配置项
 */
let PluginLoader = module.exports = function(pattern, options) {
    // 插件类型
    this.type = 'loader';
    // 以下情况入参合法
    // 1. 同时指定pattern和options，并且pattern是string，options是object
    // 2. 只指定一个参数，那么这个参数作为options使用，type是object
    // 3. 同时指定pattern和options，并且pattern值为null，options是object
    if (pattern && options && _.isPureString(pattern) && _.isPureObject(options)) {
        this.pattern = pattern;
        this.options = options;
    } else if (pattern && _.isPureObject(pattern)) {
        // extend - 如果已存在同名配置，则在原有配置基础上进行增量更新
        // override - 不论是否已存在同名配置，插件的配置项完全覆盖原有配置
        this.pattern = 'extend';
        this.options = pattern;
    } else if (!pattern && _.isPureNull(pattern) && _.isPureObject(options)) {
        this.pattern = 'extend';
        this.options = options;
    } else {
        throw Error('Invalid parameters!');
    }
    // 执行config API生成具体配置项
    apiConfig.specPluginLoader(this.pattern, this.options);
}
