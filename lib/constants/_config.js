'use strict';

let path = require('path');
/**
 * @desc 可用的配置模块
 * @type {Array}
 */
const PATTERNS = [
  'basic',
  'js',
  'style',
  'html',
  'image'
];

/**
 * @desc 基础配置，包括编译和部署等相关配置
 * @type {Object}
 */
const DEFAULT_CONFIG_BASIC = {
  // 项目名称，默认值app
  appName: 'app',
  // 本地编译目录
  localPath: {
    // 源码位置
    src: './src/',
    // 编译目标路径
    dest: './dest/',
    // 第三方库文件目录
    thirdparty: './libs/'
  },
  // build之前是否自动检查并按照node modules
  checkModulesBeforebuild: true,
  // 静态资源url是否加上query时间戳
  urlTimestamp: false,
};

/**
 * @desc javascript编译配置
 * @type {Object}
 */
const DEFAULT_CONFIG_JS = {
  // 源文件扩展名，默认为*.js
  extType: 'js',

  // 源文件使用的编码类型
  // 可以是单个string，也可以是数组
  // 默认支持es2015语法
  srcType: ['es2015'],

  // 源码js文件目录，相对于basic.localPath.src
  srcDir: 'js',
  // 编译输入目录，默认和srDir相同
  destDir: 'js',

  // js入口文件的前缀，默认为main.*.js
  mainFilePrefix: 'main',

  // 是够uglify
  uglify: true,

  // 是否使用hash指纹
  useHash: true,

  // 异步模块是否使用hash指纹
  useChunkHash: true,

  // 存在多入口文件时，可配置是否提取webpack runtime
  mutiEntriesVendor: false,

  // 是否检查语法规范
  lint: true,

  // 抛弃默认规范，使用自行规范
  // lintConfigFile: '',

  // 定义编译过程替换的变量
  // define: {
  //   api: '/api'
  // },

  // 替换json文件path
  // defineFile: '',

  // 配置编译主文件和chunk文件
  // 默认复合主文件前缀的所有js文件都是主文件，没有chunk文件
  // files: {
  //     main: {},
  //     vendor: []
  // },

  // 独立配置webpack，将覆盖默认配置
  // webpackConfig: {
  //     preloader: null,
  //     loader: {
  //         test: '',
  //         loader: '',
  //         query: {
  //
  //         }
  //     },
  //     postLoader: null,
  //     plugins: null
  // }
};

/**
 * @desc style编译配置
 * @type {Object}
 */
const DEFAULT_CONFIG_STYLE = {
  // 预编译器类型，默认为原生css
  extType: 'css',

  // 源码目录，相对于basic.localPath.src
  srcDir: 'style',
  // 编译输入目录，默认和srDir相同
  destDir: 'style',
  // 入口文件命名前缀
  mainFilePrefix: 'main',
  // 是否使用hash指纹
  useHash: true,
  // 是否自动补全hack前缀
  autoprefix: false,
  // 是否检查语法规范
  lint: true,
  // 抛弃默认规范，使用自行规范
  // lintConfigFile: '',

  // 独立配置webpack，将覆盖默认配置
  // webpackConfig: {
  //     preloader: null,
  //     loader: {
  //         test: '',
  //         loader: '',
  //         query: {
  //
  //         }
  //     },
  //     postLoader: null,
  //     plugins: null
  // }
};

/**
 * @desc html编译配置
 * @type {Object}
 */
const DEFAULT_CONFIG_HTML = {
  extType: 'html',
  srcDir: 'views',
  // 编译输入目录，默认和srDir相同
  destDir: 'views',
  // 模板入口文件的前缀，默认为index.*.html
  mainFilePrefix: 'index',
  // 是否编译输出静态资源的map文件
  staticSrcmap: false,
  // favicon路径
  favicon: null,
  // 配置需要编译的模板文件
  // 如果用户不配置，则boi将匹配模板目录下的所有模板文件
  // files: [],

  // 是否检查语法规范
  lint: true,
  // 抛弃默认规范，使用自行规范
  // lintConfigFile: '',

  // 独立配置webpack，将覆盖默认配置
  // webpackConfig: {
  //     preloader: null,
  //     loader: {
  //         test: '',
  //         loader: '',
  //         query: {
  //
  //         }
  //     },
  //     postLoader: null,
  //     plugins: null
  // }
};

/**
 * @desc image编译配置
 * @type {Object}
 */
const DEFAULT_CONFIG_IMAGE = {
  // 图片后缀名
  extType: ['png', 'jpg'],

  // 编译输入目录，默认是image
  destDir: 'image',

  // 是否对小尺寸图片进行base64编码，默认false
  base64: false,

  // base64编码的上限值
  base64Limit: 10000,

  useHash: true,

  // 独立配置webpack，将覆盖默认配置
  // webpackConfig: {
  //     preloader: null,
  //     loader: {
  //         test: '',
  //         loader: '',
  //         query: {
  //
  //         }
  //     },
  //     postLoader: null,
  //     plugins: null
  // }
};

module.exports = {
  patterns: PATTERNS,
  config: {
    'basic': DEFAULT_CONFIG_BASIC,
    'js': DEFAULT_CONFIG_JS,
    'style': DEFAULT_CONFIG_STYLE,
    'html': DEFAULT_CONFIG_HTML,
    'image': DEFAULT_CONFIG_IMAGE
  }
};
