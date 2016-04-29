'use strict'
let _ = require('../../../utils');
let loderModes = require('../../../constants').plugin.loaderModes;

/**
 * 配置loader的plugin构造函数
 * @constructor
 * @param {string} [mode=extend] - 插件工作模式
 * @param {object} options - loader配置项
 */
let PluginLoader = module.exports = function(mode, options) {
    // 插件类型
    this.type = 'loader';
    // 以下情况入参合法
    // 1. 同时指定mode和options，并且mode是string，options是object
    // 2. 只指定一个参数，那么这个参数作为options使用，type是object
    // 3. 同时指定mode和options，并且mode值为null，options是object
    if (mode && options && _.isPureString(mode) && _.isPureObject(options)) {
        this.mode = mode;
        this.options = options;
    } else if (mode && _.isPureObject(mode)) {
        // extend - 如果已存在同名配置，则在原有配置基础上进行增量更新
        // override - 不论是否已存在同名配置，插件的配置项完全覆盖原有配置
        this.mode = 'extend';
        this.options = mode;
    } else if (!mode && _.isPureNull(mode) && _.isPureObject(options)) {
        this.mode = 'extend';
        this.options = options;
    } else {
        throw Error('Invalid parameters!');
    }
    // 执行config API生成具体配置项
    boi.config.specExtraLoader(this.mode, this.options);
}
