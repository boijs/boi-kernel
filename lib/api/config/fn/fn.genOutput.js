// 生成output（本地）配置
'use strict'

let path = require('path');

module.exports = function(config) {
    let _output = null;
    let _path = path.resolve(process.cwd(), config.basic.localPath.dest);
    let _filename = config.js.useHash ? 'js/[name].[hash:8].js' : 'js/[name].js';
    // publicPath用来配置cdn url
    let _publicPath = (config.basic.cdn && path.join(config.basic.cdn.server, config.basic.cdn.path)) || '';

    _output = Object.assign({}, {
        path: _path,
        filename: _filename,
        publicPath: _publicPath
    });
    return _output;
}
