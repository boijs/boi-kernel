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
  let noParse = [];
  let dependencies = [];

  const CONFIG_STYLE = config.style;

  // 如果用户配置了webpack rules，则沿袭用户的配置
  if (CONFIG_STYLE.webpackConfig) {
    // check rules
    CONFIG_STYLE.webpackConfig.rules && (rules = CONFIG_STYLE.webpackConfig.rules);
    // check plugins
    CONFIG_STYLE.webpackConfig.plugins && (plugins = CONFIG_STYLE.webpackConfig.plugins);
    // chack noParse
    CONFIG_STYLE.webpackConfig.noParse && (noParse = CONFIG_STYLE.webpackConfig.noParse);
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


    const GetLoaders = function (ext) {
      let baseLoaders = [];
      let cssLoaderOptions = {
        url: true,
        minimize: true,
        importLoaders: ext === 'css' ? 1 : 2
      };
      // 开发环境不压缩
      if (process.env.BOI_ENV === ENV.development) {
        cssLoaderOptions.minimize = false;
      }
      let postcssPlugins = [];
      if (CONFIG_STYLE.autoprefix) {
        postcssPlugins.push(require('autoprefixer'));
      }
      if (CONFIG_STYLE.sprites) {
        // 未指定散列图标目录
        if (!CONFIG_STYLE.sprites.source) {
          Utils.log.error('Invalid css sprites configuration!');
          process.exit();
        }
        // 开发环境下禁用csss-loader的url处理功能
        if (process.env.BOI_ENV === ENV.development) {
          cssLoaderOptions.url = false;
        }
        const UpdateRule = require('postcss-sprites/lib/core').updateRule;
        let sourceDirname = Path.basename(CONFIG_STYLE.sprites.source);
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
          retina: CONFIG_STYLE.sprites.retina || false,
          relativeTo: process.env.BOI_ENV === ENV.development ? 'rule' : 'file',
          spritePath: Path.posix.join(config.basic.output, config.image.output),
          stylesheetPath: process.env.BOI_ENV === ENV.development ? Path.posix
            .join(config.basic.output, CONFIG_STYLE.output) : null,
          spritesmith: {
            padding: 5,
          },
          groupBy: image => {
            let groupName = undefined;

            if (CONFIG_STYLE.sprites.split) {
              groupName = Path.basename(Path.dirname(image.url));
            } else {
              groupName = sourceDirname;
            }
            if (CONFIG_STYLE.sprites.retina) {
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
          filterBy: image => {
            if (!REG_SPRITES_NAME.test(image.url)) {
              return Promise.reject();
            }
            return Promise.resolve();
          },
          hooks: {
            // 重命名输出的spirites图片名称
            onSaveSpritesheet: function (opts, spritesheet) {
              const FilenameChunks = spritesheet.groups.concat(
                spritesheet.extension);
              return Path.posix.join(opts.spritePath, FilenameChunks.join(
                '.'));
            },
            // 注入background-position&background-image&size
            onUpdateRule: (rule, token, image) => {
              ['width', 'height'].forEach(prop => {
                rule.insertAfter(rule.last, require('postcss').decl({
                  prop: prop,
                  value: image.coords[prop] + 'px'
                }));
              });
              UpdateRule(rule, token, image);
            }
          }
        };
        if (CONFIG_STYLE.sprites.postcssSpritesOpts) {
          postcssSpritesOpts = Object.assign({}, postcssSpritesOpts,
            CONFIG_STYLE.sprites.postcssSpritesOpts);
        }
        postcssPlugins.push(require('postcss-sprites')(postcssSpritesOpts));
      }

      baseLoaders.push({
        loader: 'css-loader',
        options: cssLoaderOptions
      });
      postcssPlugins.length>0&&baseLoaders.push({
        loader: 'postcss-loader',
        options: {
          plugins: postcssPlugins
        }
      });
      switch (ext) {
        case 'less':
          return ExtractCSS.extract({
            use: baseLoaders.concat(['less-loader']),
            publicPath: cdnPath
          });
        case 'scss':
          return ExtractCSS.extract({
            use: baseLoaders.concat(['sass-loader']),
            publicPath: cdnPath
          });
        default:
          return ExtractCSS.extract({
            use: baseLoaders,
            publicPath: cdnPath
          });
      }
    };

    // 添加字体文件loader
    rules = [{
      test: REG_EXT,
      use: GetLoaders(EXT)
    }];
    // 若使用非css后缀类型，则默认添加css构建支持
    if (EXT !== 'css') {
      rules.push({
        test: /\.css$/,
        use: GetLoaders('css')
      });
    }

    plugins.push(ExtractCSS);

    // 收集依赖模块
    dependencies = EXT_DEPS_MAP[EXT];
  }

  return {
    rules,
    noParse,
    plugins,
    dependencies
  };
};
