// 生成output（本地）配置
'use strict'

let path = require('path');

module.exports = function(config, env) {
    let _env = env || 'dev';
    let _output = null;
    let _path = path.resolve(process.cwd(), config.basic.localPath.dest);
    // let _filename = config.js.useHash ? config.js.destDir + '/[name].[hash:8].js' : 'js/[name].js';
    let _filename = config.js.useHash ? config.js.destDir + '/[name].js' : 'js/[name].js';
    // publicPath用来配置cdn url
    let _publicPath = _env === 'dev' ? '/' : (config.basic.cdn && 'http://' + path.join(config.basic.cdn.server,
        config.basic.cdn.path)) || '';

    _output = Object.assign({}, {
        path: _path,
        filename: _filename,
        publicPath: _publicPath,
        chunkFilename: '[name].js'
    });
    return _output;
}
