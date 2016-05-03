// 生成module loader和plugins配置项
'use strict'

let path = require('path');
let ora = require('ora');
let colors = require('colors');

let CleanWebpackPlugin = require('clean-webpack-plugin');

let fn_genMPStyle = require('./fn.genMP.style.js');
let fn_genMPJs = require('./fn.genMP.js.js');
let fn_genMPHtml = require('./fn.genMP.html.js');

let spinner = ora();
spinner.color = 'blue';

require('shelljs/global');

module.exports = function(config) {
    let _result = null,
        _module = null,
        _plugins = [];

    let _loaders = [],
        _preloader = [],
        _postloader = [],
        _noParse = [];

    let _loader_image = null,
        _loader_js = null,
        _loader_style = null,
        _loader_html = null;

    // clean before build
    _plugins.push(new CleanWebpackPlugin([path.resolve(process.cwd(), config.basic.localPath.dest)], {
        root: '/',
        verbose: true,
        dry: false
    }));

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
    let _mp_js = fn_genMPJs(config.js);
    if (_mp_js.preloader) {
        _preloader.push(_mp_js.preloader);
    }
    if (_mp_js.postloader) {
        _postloader.push(_mp_js.postloader);
    }
    if (_mp_js.plugin) {
        _plugins = _plugins.concat(_mp_js.plugins);
    }
    _loader_js = _mp_js.loader;

    // style文件的loader&preloader&postloader
    // 用户可以自行配置loaders，如果不自行配置则根据默认配置项生成
    let _mp_style = fn_genMPStyle(config);
    if (_mp_style.preloader) {
        _preloader.push(_mp_style.preloader);
    }
    if (_mp_style.postloader) {
        _postloader.push(_mp_style.postloader);
    }
    if (_mp_style.plugins) {
        _plugins = _plugins.concat(_mp_style.plugins);
    }
    _loader_style = _mp_style.loader;

    // 模板文件的loader&preloader&postloader
    // 用户可以自行配置loaders，如果不自行配置则根据默认配置项生成
    let _mp_html = fn_genMPHtml(config);
    if (_mp_html.preloader) {
        _preloader.push(_mp_html.preloader);
    }
    if (_mp_html.postloader) {
        _postloader.push(_mp_html.postloader);
    }
    if (_mp_html.plugins) {
        _plugins = _plugins.concat(_mp_html.plugins);
    }
    _loader_html = _mp_html.loader;

    // 由自定义插件配置的module和plugin
    let __extraMP = {
        preloader: [],
        postloader: [],
        loaders: [],
        noParse: [],
        plugins: []
    };
    if (config.extraLoaders) {
        config.extraLoaders.forEach(function(v, i) {
            v.module.loader && __extraMP.loaders.push(v.module.loader);
            v.module.preloader && __extraMP.preloader.push(v.module.preloader);
            v.module.postloader && __extraMP.postloader.push(v.module.postloader);
            v.module.noParse && __extraMP.noParse.push(v.module.noParse);
            v.module.plugins && __extraMP.plugins.push(v.module.plugins);
            // npm 3.0.0以下版本node_modules无限嵌套引起无法寻址
            // 所以将自定义插件的依赖全部安装在一级node_modules目录
            if (parseInt(exec('npm -v')) < 3) {
                if (v.dependencies && v.dependencies.length !== 0) {
                    v.dependencies.forEach(function(mod) {
                        try {
                            require.resolve(path.resolve(process.cwd(), 'node_modules', mod));
                        } catch (e) {
                            spinner.text = 'Install ' + mod + '......\n';
                            spinner.start();
                            // console.log(colors.blue('Install ' + mod + '......\n'));
                            exec('npm install ' + mod);
                            // console.log(colors.blue('Install ' + mod + '...... Done!\n'));
                            spinner.text = 'Install ' + mod + '...... Done!\n';
                            spinner.stop();
                        }
                    });
                }
            }
        });
    }
    _module = Object.assign({}, {
        preloader: _preloader,
        loaders: [
            _loader_image,
            _loader_js,
            _loader_style
        ].concat(__extraMP.loaders),
        postloader: _postloader,
        // noParse: _noParse
    });

    return Object.assign({}, {
        module: _module,
        plugins: _plugins.concat(__extraMP.plugins)
    });
}
