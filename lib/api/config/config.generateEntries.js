// 生成entry（打包入口文件）配置
'use strict'
let path = require('path');
let glob = require('glob');

module.exports = function(conf) {
    let _entries = {};
    let _jsDir = path.resolve(process.cwd(), conf.src.dirname, conf.js.dirname);
    let _ext = conf.js.ext || 'js';

    const REG_MAIN_FULL = new RegExp('main\\.\\w+\\.' + _ext + '$');
    const REG_MAIN_NAME = /^main\.\w+/;
    // 如果详细配置入口文件，则只针对已配置的文件进行构建
    // 如果没有详细配置入口文件，则默认遍历指定js文件目录和子目录中所有以main.*.js命名的文件
    if (conf.js.main && _.isPureObject(conf.js.main)) {
        for (let filename in conf.js.main) {
            _entries[filename] = path.join(_jsDir, conf.js.main[filename] +
                '.' + _ext);
        }
    } else {
        // 遍历子目录
        let _jsEntries = glob.sync(_jsDir + '/**/main.*.' + _ext);
        _jsEntries.forEach((filePath) => {
            let _filename = REG_MAIN_NAME.exec(REG_MAIN_FULL.exec(
                filePath));
            _entries[_filename] = filePath;
        });
    }
    return _entries;
}
