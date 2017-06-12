'use strict';

require('shelljs/global');
const _ = require('lodash');
const Path = require('path');
const Utils = require('../../../utils');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

const ENV = require('../../../constants').env;

// 各类型文件对应的dependencies
const EXT_DEPS_MAP = {
  css: ['postcss-loader'],
  less: ['less', 'less-loader', 'postcss-less', 'postcss-loader'],
  scss: ['sass-loader', 'node-sass', 'postcss-scss', 'postcss-loader']
};

module.exports = function (config) {
  let rules = [];
  let plugins = [];
  let extras = null;
  let dependencies = [];

  const CONFIG_STYLE = config.style;

  // 如果用户配置了webpack rules，则沿袭用户的配置
  if (CONFIG_STYLE.webpackConfig) {
    // check rules
    CONFIG_STYLE.webpackConfig.rules && _.isArray(CONFIG_STYLE.webpackConfig.rules) &&
      (rules = rules.concat(CONFIG_STYLE.webpackConfig.rules));
    // check plugins
    CONFIG_STYLE.webpackConfig.plugins && (plugins = plugins.concat(
      CONFIG_STYLE.webpackConfig.plugins));
    // check extras
    extras = Utils.mapWpExtras(options);
  } else {
    const EXT = CONFIG_STYLE.ext || 'css';
    const REG_EXT = new RegExp('\\.' + EXT + '$');
    const FILENAME = process.env.BOI_ENV !== ENV.development && CONFIG_STYLE.useHash ?
      '[name].[contenthash:8].css' :
      '[name].css';

    const ExtractCSS = new ExtractTextPlugin({
      filename: Path.posix.join(CONFIG_STYLE.output, FILENAME),
      allChunks: true
    });

    // ExtractTextPlugin中publicPath配置的作用是替换style文件中引用图片的根目录
    let cdnPath = '/';
    if (process.env.BOI_ENV !== ENV.development && global.boi_deploy_cdn) {
      cdnPath = (cdnInfo => {
        let _path = '/';
        if (cdnInfo.domain) {
          _path = [
              cdnInfo.domain && cdnInfo.domain.replace(/^(http(s)?\:)?\/*/,
              '//').replace(/\/*$/, ''),
              cdnInfo.path && Path.posix.join('/', cdnInfo.path, '/') || '/'
            ].join('');
        } else if (cdnInfo.path) {
          if (Path.isAbsolute(cdnInfo.path)) {
            _path = Path.posix.join(cdnInfo.path, '/');
          } else {
            _path = Path.relative(CONFIG_STYLE.output, config.image
              .output).replace(
              config.image.output, '');
          }
        }
        return _path;
      })(global.boi_deploy_cdn);
    }


    let getLoaders = ((autoprefix, spritesInfo) => {
      let baseLoaders = [];
      let postcssPlugins = [];
      baseLoaders.push('css-loader');
      if(autoprefix){
        postcssPlugins.push(require('autoprefixer'));
      }
      if (spritesInfo) {
        if (!spritesInfo.source) {
          Utils.log.error('Invalid css sprites configuration!');
          process.exit();
        }

        let sourceDirname = Path.basename(spritesInfo.source);
        // 合法的散列图路径
        const REG_SPRITES_NAME = new RegExp(sourceDirname);
        // 合法的retina标识
        const REG_SPRITES_RETINA = new RegExp([
            '@(\\d+)x\\.',
            _.isArray(config.image.ext) ? '(' + config.image.ext.join('|') +
            ')' : config.image.ext,
          ].join(''), 'i');
        /**
         * postcss-sprites默认配置项
         * @type {Object}
         * @see https://github.com/2createStudio/postcss-sprites
         */
        let postcssSpritesOpts = {
          retina: spritesInfo.retina || false,
          spritePath: './.tmp_sprites',
          stylesheetPath: Path.posix.join(config.basic.output,
            CONFIG_STYLE.output),
          groupBy: (image) => {
            let groupName = undefined;

            if (spritesInfo.split) {
              groupName = Path.basename(Path.dirname(image.url));
            } else {
              groupName = sourceDirname;
            }
            if (spritesInfo.retina) {
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
              require('postcss-sprites/lib/core').updateRule(
                rule, token, image);
              // 注入background-position
                ['width', 'height'].forEach(function (prop) {
                rule.insertAfter(rule.last, require(
                  'postcss').decl({
                  prop: prop,
                  value: image.coords[prop] + 'px'
                }));
              });
            }
          }
        };
        if (spritesInfo.postcssSpritesOpts) {
          postcssSpritesOpts = Object.assign({}, postcssSpritesOpts,
            spritesInfo.postcssSpritesOpts);
        }
        postcssPlugins.push(require('postcss-sprites')(postcssSpritesOpts));
      }
      baseLoaders.push({
        loader: 'postcss-loader',
        options: {
          plugins: postcssPlugins
        }
      });

      return {
        css: ExtractTextPlugin.extract({
          use: baseLoaders,
          publicPath: cdnPath
        }),
        less: ExtractTextPlugin.extract({
          use: baseLoaders.concat(['less-loader']),
          publicPath: cdnPath
        }),
        scss: ExtractTextPlugin.extract({
          use: baseLoaders.concat(['sass-loader']),
          publicPath: cdnPath
        })
      };
    })(CONFIG_STYLE.autoprefix, CONFIG_STYLE.sprites);

    // 添加字体文件loader
    rules = [{
      test: REG_EXT,
      use: getLoaders[EXT]
    }];
    // 若使用非css后缀类型，则默认添加css构建支持
    if (EXT !== 'css') {
      rules.push({
        test: /\.css$/,
        use: getLoaders['css']
      });
    }

    plugins.push(ExtractCSS);

    // 收集依赖模块
    dependencies = EXT_DEPS_MAP[EXT];
  }

  return {
    rules,
    plugins,
    extras,
    dependencies
  };
};
