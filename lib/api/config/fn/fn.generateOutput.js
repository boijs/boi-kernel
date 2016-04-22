// 生成output（本地）配置
'use strict'

let path = require('path');

module.exports = function(conf) {
    let _output = null;
    let _path = path.resolve(process.cwd(), conf.dest.dirname, conf.js.dirname);
    let _filename = '[name].[hash:8].min.js';

    _output = Object.assign({}, {
        path: _path,
        filename: _filename
    });
    return _output;
}
