// 生成output（本地）配置
'use strict'

let path = require('path');

module.exports = function(config, env) {
    let _env = env || 'dev';
    let _output = null;
    let _publicPath = '';
    let _path = path.resolve(process.cwd(), config.basic.localPath.dest);
    let _filename = config.js.destDir + (_env === 'prod' && config.js.useHash ? '/[name].[chunkhash:8].js' : '/[name].js');
    let _chunkFilename = path.join(config.js.destDir, 'part/') + config.basic.appName + (config.js.useHash ? '.[name].[chunkhash:8].js' : '.[name].js');
    // publicPath用来配置cdn url
    // dev环境下务必将publicPath设置为/，避免相对路径的引用
    if (_env === 'prod') {
        _publicPath = config.basic.cdn ? 'http://' + path.join(config.basic.cdn.server,
            config.basic.cdn.path) : '/'
    } else {
        _publicPath = '/';
    }

    _output = Object.assign({}, {
        path: _path,
        filename: _filename,
        publicPath: _publicPath,
        chunkFilename: _chunkFilename
    });
    return _output;
}
