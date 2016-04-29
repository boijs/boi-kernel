// 生成output（本地）配置
'use strict'

let path = require('path');

module.exports = function(config) {
    let _output = null;
    let _path = path.resolve(process.cwd(), config.basic.localPath.dest);
    let _filename = config.js.useHash ? 'js/[name].[chunkhash:8].js' : 'js/[name].js';

    _output = Object.assign({}, {
        path: _path,
        filename: _filename
    });
    return _output;
}
