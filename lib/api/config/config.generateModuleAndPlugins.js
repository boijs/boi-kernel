// 生成module loader和plugins配置项
'use strict'

let generateStyleConf = require('./config.generateStyleConf.js');

module.exports = function(conf) {
    let _result = null,
        _module = null,
        _plugins = [];
    let _loaders = null,
        _loader_image = null,
        _loader_js = null,
        _loader_style;
    // image loader
    // 用户可以自行配置loaders，如果不自行配置则根据配置项生成
    _loader_image = conf.image || ((opts) => {
        let __test =
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
    })(conf.image);

    // js loader
    // 用户可以自行配置loaders，如果不自行配置则根据transfer的配置项生成
    _loader_js = (conf.js.transfer && conf.js.transfer.loaders) || ((opts) => {
        if (!opts) {
            return null;
        }
        let _srcType = opts.srcType.join('|');
        let _presets = [];
        // 默认使用babel stage-0
        _presets.push('stage-0');
        if (/(es2015|es6)/.test(_srcType)) {
            _presets.push('es2015');
        }
        if (/react/.test(_srcType)) {
            _presets.push('react');
        };
        return Object.assign({}, {
            test: /\.(jsx?|es)$/,
            exclude: [/node_modules/]
        }, {
            loader: 'babel',
            query: {
                presets: _presets,
                cacheDirectory: true,
                plugins: ['syntax-object-rest-spread']
            }
        });
    })(conf.js.transfer);

    let _styleConf = generateStyleConf(conf);
    _loader_style = _styleConf.loader;
    _plugins.push(_styleConf.plugin);

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
