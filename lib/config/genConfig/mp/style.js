'use strict'

let _ = require('lodash');
let path = require('path');
let webpack = require('webpack');
let utils = require('../../../utils');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let StyleLintPlugin = require('stylelint-webpack-plugin');

const ENV = require('../../../constants').env;
// 各类型文件对应的dependencies
const EXT_DEPS_MAP = {
  css: ['css-loader'],
  less: ['css-loader', 'less-loader', 'postcss-less'],
  scss: ['css-loader', 'sass-loader', 'node-sass', 'postcss-scss'],
  sass: ['css-loader', 'sass-loader', 'node-sass', 'postcss-scss'],
  stylus: ['css-loader', 'stylus-loader'],
  styl: ['css-loader', 'stylus-loader']
}

module.exports = function(config) {
  let loaders = [];
  let preLoaders = [];
  let postLoaders = [];
  let plugins = [];
  let extras = null;
  let dependencies = [];

  const CONFIG_STYLE = config.style;

  // 如果用户配置了webpack loaders，则沿袭用户的配置
  CONFIG_STYLE.webpackConfig && ((options) => {
    // check preLoader & preLoaders
    options.preLoader && _.isPlainObject(options.preLoader) && preLoaders.push(Object.assign({},
      CONFIG_STYLE.webpackConfig.preLoader));
    options.preLoaders && _.isArray(options.preLoaders) && (preLoaders = preLoaders.concat(
      options.preLoaders));
    // check loader & loaders
    options.loader && _.isPlainObject(options.loader) && loaders.push(Object.assign({},
      CONFIG_STYLE.webpackConfig.loader));
    options.loaders && _.isArray(options.loaders) && (preLoaders = loaders.concat(options.loaders));
    // check postloader & postloaders
    options.postloader && _.isPlainObject(options.postloader) && postLoaders.push(Object.assign({},
      CONFIG_STYLE.webpackConfig.postloader));
    options.postloaders && _.isArray(options.postloaders) && (postLoaders = postLoaders.concat(
      options.postloaders));
    // check plugins
    options.plugins && (plugins = plugins.concat(options.plugins));
    // check extras
    extras = utils.mapWpExtras(options);
  })(CONFIG_STYLE.webpackConfig);

  (() => {

    const EXTTYPE = CONFIG_STYLE.extType || 'css';

    const REG_EXTTYPE = new RegExp('\\.' + EXTTYPE + '$');

    // @important 必须使用contenthash，不能用hash或chunkhash
    const FILENAME = process.env.BOI_ENV !== ENV.development && CONFIG_STYLE.useHash ?
      '[name].[contenthash:8].css' :
      '[name].css';

    let extractCSS = new ExtractTextPlugin(path.posix.join(CONFIG_STYLE.destDir, FILENAME), {
      allChunks: true
    });
    /**
     * @desc 非dev环境下加入stylelint plugin
     * @see https://github.com/vieron/stylelint-webpack-plugin
     */
    process.env.BOI_ENV !== ENV.development && CONFIG_STYLE.lint && (() => {
      let _configFile = '';
      if (CONFIG_STYLE.lintConfigFile) {
        _configFile = path.isAbsolute(CONFIG_STYLE.lintConfigFile) ? CONFIG_STYLE.lintConfigFile :
          path.posix.join(process.cwd(), CONFIG_STYLE.lintConfigFile);
      } else {
        try {
          _configFile = require.resolve(path.posix.join(process.cwd(), 'node_modules',
            'boi-aux-rule-stylelint'));
        } catch (e) {
          exec('npm install boi-aux-rule-stylelint --registry=https://registry.npm.taobao.org --save-dev');
          _configFile = require.resolve(path.posix.join(process.cwd(), 'node_modules',
            'boi-aux-rule-stylelint'));
        }
      }
      plugins.push(new StyleLintPlugin({
        configFile: _configFile,
        files: [path.posix.join(config.basic.localPath.src, '**', '*.' + EXTTYPE)],
        syntax: EXTTYPE
      }));
    })();

    loaders.length === 0 && (() => {
      // 图片可能被部署到独立的cdn
      // ExtractTextPlugin中publicPath配置的作用是替换style文件中引用图片的根目录
      let _imageCdn = null;
      let _boiCdn = global.boi_deploy_cdn;

      if (process.env.BOI_ENV !== ENV.development) {
        let _cdn = _boiCdn && (_boiCdn.image && _boiCdn.image.domain ? _boiCdn.image :
          _boiCdn.default);
        _cdn && (_imageCdn = _cdn.domain && (_cdn.domain.replace(/^(http(s)?\:)?\/*/,
          '\/\/') + path.posix.join('/', _cdn.path || '')) || path.posix.join('/', _cdn
          .path || ''));
      }

      function generateLoaders(loaders) {
        if (_imageCdn) {
          return extractCSS.extract(loaders.join('!'), {
            publicPath: _imageCdn
          });
        } else {
          return extractCSS.extract(loaders.join('!'), {
            publicPath: '/'
          });
        }
      }

      let _loaders = ((autoprefix, sprites, spritesConfig) => {
        let baseLoaders = [];
        autoprefix ? baseLoaders.push('css') : baseLoaders.push('css?-autoprefixer');
        if (sprites) {
          if (!spritesConfig || !spritesConfig.dir) {
            throw new Error(utils.log.error('Invalid css sprites configuration!'));
            process.exit();
          }
          baseLoaders.push('postcss');

          // 合法的散列图，包括path和后缀
          const REG_SPRITES_NAME = new RegExp([
            path.posix.normalize(spritesConfig.dir).replace(/^\.*/, '').replace(
              /\//, '\\/'),
            '\\/\.+\\.',
            _.isArray(config.image.extType) ? '(' + config.image.extType.join('|') +
            ')' : config.image.extType,
            '\$'
          ].join(''), 'i');
          // 合法的散列图path
          const REG_SPRITES_PATH = new RegExp([
            path.posix.normalize(spritesConfig.dir).replace(/^\.*/, '').replace(
              /\//, '\\/'),
            '\\/(.*?)\\/.*'
          ].join(''), 'i');
          // 合法的retina标识
          const REG_SPRITES_RETINA = new RegExp([
            '@(\\d+)x\\.',
            _.isArray(config.image.extType) ? '(' + config.image.extType.join('|') +
            ')' : config.image.extType,
          ].join(''), 'i');
          /**
           * postcss-sprites默认配置项
           * @type {Object}
           * @see https://github.com/2createStudio/postcss-sprites
           */
          let postcssSpritesOpts = {
            retina: spritesConfig.retina || false,
            spritePath: './.tmp_sprites',
            stylesheetPath: path.posix.join(config.basic.localPath.dest, CONFIG_STYLE
              .destDir),
            groupBy: (image) => {
              let groups = null;
              let groupName = undefined;

              if (spritesConfig && spritesConfig.split) {
                groups = REG_SPRITES_PATH.exec(image.url);
                groupName = groups ? groups[1] : 'icons';
              } else {
                groupName = 'icons';
              }
              if (spritesConfig && spritesConfig.retina) {
                image.retina = true;
                image.ratio = 1;
                let ratio = REG_SPRITES_RETINA.exec(image.url);
                if (ratio) {
                  ratio = ratio[1];
                  while (ratio > 10) {
                    ratio = ratio / 10;
                  }
                  image.ratio = ratio;
                  image.groups = image.groups.filter((group) => {
                    return ('@' + ratio + 'x') !== group;
                  });
                  groupName += '@' + ratio + 'x';
                }
              }
              return Promise.resolve(groupName);
            },
            filterBy: (image) => {
              if (!REG_SPRITES_NAME.test(image.url)) {
                return Promise.reject();
              }
              return Promise.resolve();
            },
            hooks: {
              onUpdateRule: (rule, token, image) => {
                require('postcss-sprites/lib/core').updateRule(rule, token, image);
                // 注入background-position
                ['width', 'height'].forEach(function(prop) {
                  rule.insertAfter(rule.last, require('postcss').decl({
                    prop: prop,
                    value: image.coords[prop] + 'px'
                  }));
                });
              }
            }
          };
          if (CONFIG_STYLE.spriteConfig && CONFIG_STYLE.spriteConfig.postcssSpritesOpts) {
            postcssSpritesOpts = Object.assign({}, postcssSpritesOpts, CONFIG_STYLE.spriteConfig
              .postcssSpritesOpts)
          }
          extras = Object.assign({}, extras, {
            postcss: function() {
              return [
                require('postcss-sprites')(postcssSpritesOpts)
              ];
            }
          });
        }

        return {
          css: generateLoaders(baseLoaders),
          less: generateLoaders(baseLoaders.concat(['less'])),
          sass: generateLoaders(baseLoaders.concat(['sass?indentedSyntax'])),
          scss: generateLoaders(baseLoaders.concat(['sass'])),
          stylus: generateLoaders(baseLoaders.concat(['stylus'])),
          styl: generateLoaders(baseLoaders.concat(['stylus'])),
        }
      })(CONFIG_STYLE.autoprefix, CONFIG_STYLE.sprites, CONFIG_STYLE.spritesConfig);

      loaders.push({
        test: REG_EXTTYPE,
        loader: _loaders[EXTTYPE]
      });

      plugins.push(extractCSS);

      // 收集依赖模块
      dependencies = dependencies.concat(((type) => {
        let _deps = [];
        let loaders = EXT_DEPS_MAP[type];
        let _reg = /\?/;
        _deps = loaders.filter(function(loader) {
          if (_reg.test(loader)) {
            loader = loader.split(_reg)[0];
          }
          return loader !== 'css-loader';
        });
        return _deps;
      })(EXTTYPE));
    })();
  })();

  return {
    preLoaders,
    postLoaders,
    loaders,
    plugins,
    extras,
    dependencies
  };
};
