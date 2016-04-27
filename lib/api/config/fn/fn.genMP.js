// 生成module loader和plugins配置项
'use strict'

let path = require('path');

let fn_genMPStyle = require('./fn.genMP.style.js');
let fn_genMPJs = require('./fn.genMP.js.js');

module.exports = function(config) {
    let _result = null,
        _module = null,
        _plugins = [];

    let _loaders = [],
        _preloader = [],
        _postloader = [];

    let _loader_image = null,
        _loader_js = null,
        _loader_style = null;

    // image loader
    // 用户可以自行配置loaders，如果不自行配置则根据配置项生成
    _loader_image = config.resource.image.loader || ((opts) => {
        let __test = opts.extType ? new RegExp('(' + opts.extType.join('|') + ')$') :
            /\.((woff2?|svg)(\?v=[0-9]\.[0-9]\.[0-9]))|(woff2?|svg|jpe?g|png|gif|ico)$/;
        let __loaders = [];
        if (opts.base64) {
            __loaders.push('url?limit=' + (opts.base64Limit | '10000') +
                '&name=img/[name].[hash:8].[ext]');
        }
        __loaders.push(
            'image?{bypassOnDebug:true, progressive:true,optimizationLevel:3,pngquant:{quality:"65-80",speed:4}}'
        );
        return {
            test: __test,
            loaders: __loaders
        }
    })(config.resource.image);

    // js文件的loader&preloader&postloader
    // 用户可以自行配置loaders，如果不自行配置则根据默认配置项生成
    let __loader_js = fn_genMPJs(config.js);
    if (__loader_js.preloader) {
        _preloader.push(__loader_js.preloader);
    }
    if (__loader_js.postloader) {
        _postloader.push(__loader_js.postloader);
    }
    if (__loader_js.plugin) {
        _plugins = _plugins.concat(__loader_js.plugins);
    }
    _loader_js = __loader_js.loader;

    // style文件的loader&preloader&postloader
    // 用户可以自行配置loaders，如果不自行配置则根据默认配置项生成
    let __loader_style = fn_genMPStyle(config);
    if (__loader_style.preloader) {
        _preloader.push(__loader_style.preloader);
    }
    if (__loader_style.postloader) {
        _postloader.push(__loader_style.postloader);
    }
    if (__loader_style.plugins) {
        _plugins = _plugins.concat(__loader_style.plugins);
    }
    _loader_style = __loader_style.loader;

    _module = Object.assign({}, {
        loaders: [
            _loader_image,
            _loader_js,
            _loader_style
        ]
    });
    return Object.assign({}, {
        module: _module,
        plugins: _plugins
    });
}
