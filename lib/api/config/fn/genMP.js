// 生成module loader和plugins配置项
'use strict'

let path = require('path');
let ora = require('ora');
let colors = require('colors');

let webpack = require('webpack');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');

let fn_genMPStyle = require('./genMP.style.js');
let fn_genMPJs = require('./genMP.js.js');
let fn_genMPHtml = require('./genMP.html.js');

let spinner = ora();
spinner.color = 'blue';

require('shelljs/global');

module.exports = function(config, env) {
    let _result = null,
        _module = null,
        _plugins = [];

    let _loaders = [],
        _preloader = [],
        _postloader = [],
        _noParse = [],
        _extras = null;

    let _loader_image = null,
        _loader_js = null,
        _loader_style = null,
        _loader_html = null;


    // clean before build
    _plugins.push(new CleanWebpackPlugin([path.resolve(process.cwd(), config.basic.localPath.dest)], {
        root: '/',
        verbose: false,
        dry: false
    }));

    // dev环境下额外使用dev server需要的一组插件
    if (env === 'dev') {
        _plugins.concat([
            new webpack.optimize.OccurenceOrderPlugin(),
            new webpack.HotModuleReplacementPlugin(),
            new webpack.NoErrorsPlugin()
        ])
    }

    // 插件比config API有更高优先级
    // 使用插件进行的配置（extend类型除外）将覆盖通过config API配置的同名项
    if (config.pluginPatterns && config.pluginPatterns.length !== 0) {
        config.pluginPatterns.forEach(function(pattern) {
            config[pattern] = null;
        });
    }
    // image loader
    // 用户可以自行配置loaders，如果不自行配置则根据配置项生成
    _loader_image = config.image.loader || ((opts) => {
        let __test = opts.extType ? new RegExp('(' + opts.extType.join('|') + ')$') :
            /\.((woff2?|svg)(\?v=[0-9]\.[0-9]\.[0-9]))|(woff2?|svg|jpe?g|png|gif|ico)$/;
        let __loaders = [];
        // 可配置小尺寸图片使用base64编码
        if (opts.base64) {
            __loaders.push('url?limit=' + (opts.base64Limit | '10000') +
                '&name=' + opts.destDir + '/[name].[hash:8].[ext]');
        } else {
            __loaders.push('file?name=' + (opts.cdn ? '' : (opts.destDir || 'image')) +
                '/[name].[hash:8].[ext]');
        }
        __loaders.push(
            'image?{bypassOnDebug:true, progressive:true,optimizationLevel:3,pngquant:{quality:"65-80",speed:4}}'
        );
        return {
            test: __test,
            loaders: __loaders
        }
    })(config.image);
    _loaders.push(_loader_image);

    // js文件的loader&preloader&postloader
    // 用户可以自行配置loaders，如果不自行配置则根据默认配置项生成
    let _mp_js = fn_genMPJs(config);
    if (_mp_js) {
        if (_mp_js.preloader) {
            _preloader.push(_mp_js.preloader);
        }
        if (_mp_js.postloader) {
            _postloader.push(_mp_js.postloader);
        }
        if (_mp_js.plugin) {
            _plugins = _plugins.concat(_mp_js.plugins);
        }
        if (_mp_js.noParse) {
            _noParse = _noParse.concat(_mp_js.noParse);
        }
        _loader_js = _mp_js.loader;
        _loaders.push(_loader_js);
    }

    // style文件的loader&preloader&postloader
    // 用户可以自行配置loaders，如果不自行配置则根据默认配置项生成
    let _mp_style = fn_genMPStyle(config, env);
    if (_mp_style) {
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
        _loaders.push(_loader_style);
    }

    // 模板文件的loader&preloader&postloader
    // 用户可以自行配置loaders，如果不自行配置则根据默认配置项生成
    let _mp_html = fn_genMPHtml(config);
    if (_mp_html) {
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
        _loaders.push(_loader_html);
    }


    // 由自定义插件配置的module和plugin
    let __extraMP = {
        preloader: [],
        postloader: [],
        loaders: [],
        noParse: [],
        plugins: []
    };
    // 插件比config API有更高的优先级
    if (config.extraLoaders) {
        let _needInstall = parseInt(exec('npm -v')) < 3;
        config.extraLoaders.forEach(function(v, i) {
            v.module.loader && __extraMP.loaders.push(v.module.loader);
            v.module.loaders && v.module.loaders.length !== 0 && (__extraMP.loaders = __extraMP.loaders.concat(
                v.module
                .loaders));
            v.module.preloader && __extraMP.preloader.push(v.module.preloader);
            v.module.postloader && __extraMP.postloader.push(v.module.postloader);
            v.noParse && __extraMP.noParse.push(v.noParse);
            v.plugins && (__extraMP.plugins = __extraMP.plugins.concat(v.plugins));
            // webpack额外配置项
            if (v.extra) {
                _extras = Object.assign({}, _extras, v.extra);
            }
            // npm 3.0.0以下版本node_modules无限嵌套引起无法寻址
            // 所以将自定义插件的依赖全部安装在一级node_modules目录
            if (_needInstall) {
                if (v.dependencies && v.dependencies.length !== 0) {
                    v.dependencies.forEach(function(mod) {
                        try {
                            require.resolve(path.resolve(process.cwd(), 'node_modules', mod));
                        } catch (e) {
                            spinner.text = 'Install ' + mod + '......\n';
                            spinner.start();
                            exec('npm install ' + mod);
                            spinner.text = 'Install ' + mod + '...... Done!\n';
                            spinner.stop();
                        }
                    });
                }
            }
        });
    }
    _plugins.push(new ExtractTextPlugin('style.css'))
    _module = Object.assign({}, {
        preloader: _preloader,
        loaders: _loaders.concat(__extraMP.loaders),
        postloader: _postloader,
        noParse: _noParse
    });
    // uglify
    if (env !== 'dev') {
        _plugins.push(new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: true
            },
            sourceMap: false,
            mangle: {
                except: ['$', 'exports', 'require']
            }
        }));
    }
    return Object.assign({}, {
        module: _module,
        plugins: _plugins.concat(__extraMP.plugins)
    }, {
        extras: _extras
    });
}
