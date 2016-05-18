// 生成entry（打包入口文件）配置
'use strict'
let path = require('path');
let glob = require('glob');

let webpack = require('webpack');

let _ = require('../../../utils');

module.exports = function(config) {
    let _entry = {},
        _plugins = [];

    let _mutipleEnties = false;

    // js文件目录绝对路径
    let _jsDir = path.resolve(process.cwd(), config.basic.localPath.src, config.js.srcDir);

    let _configJs = config.js;
    let _extType = _configJs.extType || 'js';
    // js入口文件的前缀名称，默认为main.*.[js]
    let _mainFilePrefix = _configJs.mainFilePrefix || 'main';
    // js入口文件的全名正则
    const REG_MAIN_FULL = new RegExp(_mainFilePrefix + '\\.\\w+\\.' + _extType + '$');
    // js入口文件的除去文件类型部分的正则
    const REG_MAIN_NAME = new RegExp(_mainFilePrefix + '\\.\\w+');

    // 如果详细配置入口文件，则只针对已配置的文件进行构建
    // 如果没有详细配置入口文件，则默认遍历指定js文件目录和子目录中所有以main.*.js命名的文件
    if (_configJs.files && _configJs.files.main && _.isPureObject(_configJs.files.main)) {
        for (let filename in _configJs.files.main) {
            if (REG_MAIN_FULL.test(_configJs.main[filename])) {
                _entry[filename] = path.join(_jsDir, _configJs.main[filename]);
            } else {
                _entry[filename] = path.join(_jsDir, _configJs.main[filename] + '.' + _extType);
            }
        }
    } else {
        // 遍历目录及子目录，获取js入口文件的绝对路径
        let _jsEntries = glob.sync(_jsDir + '/**/' + _mainFilePrefix + '.*.' + _extType);
        _jsEntries.forEach((filePath) => {
            // console.log(REG_MAIN_FULL.exec(filePath))
            let _filename = REG_MAIN_NAME.exec(REG_MAIN_FULL.exec(filePath));
            _entry[_filename] = filePath;
        });
    }

    // 如果配置了vendor模块，则将vendor模块编译为独立的js文件
    if (_configJs.files && _configJs.files.vendor && _configJs.files.vendor.length !== 0) {
        _entry['vendor'] = _configJs.files.vendor;
        _plugins.push(new webpack.optimize.CommonsChunkPlugin({
            name: 'vendor',
            filename: 'js/vendor/vendor.js'
        }));
    } else if (_.getKeysSum(_entry) > 1) {
        // 如果没有配置vendor模块，同时有一个以上entry模块，这种情况下仍然需要生成vendor模块
        // 此时的vendor模块没有任何逻辑相关代码，只包含webpack runtime
        // @see http://webpack.github.io/docs/list-of-plugins.html#commonschunkplugin
        _mutipleEnties = true;
        _plugins.push(new webpack.optimize.CommonsChunkPlugin('js/vendor/vendor.js'));
    }
    return {
        entry: _entry,
        plugins: _plugins
    };
}
