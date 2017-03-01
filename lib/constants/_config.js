'use strict';

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
  appname: 'app',
  // 源码目录
  source: './src/',
  // 编译输出目录
  output: './dest/',
  // 第三方库文件目录
  libs: './libs/',
  // 是否检查并安装依赖模块
  checkDependencies: false
};

/**
 * @desc javascript编译配置
 * @type {Object}
 */
const DEFAULT_CONFIG_JS = {
  // 源文件扩展名
  ext: 'js',

  // 源码js文件目录，相对于basic.source
  source: 'js',
  // 编译输入目录，相对于basic.output
  output: 'js',

  // js入口文件的前缀，入口文件的命名规则为[mainFilePrefix].*.[ext]
  mainFilePrefix: 'main',

  // 是否开启uglify功能
  uglify: true,

  // 是否使用hash指纹
  useHash: true,

  // 异步模块是否使用hash指纹
  asyncModuleHash: true,

  // 是否将公共模块提取为独立文件
  splitCommonModule: false,

  // 是否开启代码规范检查
  lint: false,

  // 指定代码规范配置文件
  // lintConfigFile: '',

  // 定义编译过程替换的变量
  // define: {
  //   API: '/api'
  // },

  // 自行指定入口文件，未指定的文件即使符合命名规范也不会参与编译
  // common赋值为空数组时将提取webpack runtime作为common模块
  // files: {
  //     main: {},
  //     common: []
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
  ext: 'css',
  source: 'style',
  output: 'style',

  // 是否使用hash指纹
  useHash: true,
  // 是否自动补全hack前缀
  autoprefix: false,

  mainFilePrefix: 'main',

  // sprites配置项
  sprites: {
    // 散列图片目录
    source: 'icons',
    // 是否根据子目录分别编译输出
    split: true,
    // 是否识别retina命名标识
    retina: true,
    // 自行配置postcss-sprite编译配置
    // @see https://github.com/2createStudio/postcss-sprites
    postcssSpritesOpts: null
  }
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
  // 源文件后缀类型，默认为html
  ext: 'html',
  // 模板引擎，默认为html
  engine: 'html',
  // 如果采用模板引擎，此配置项为true时将模板语法编译为HTML语法，false时保留原语法
  buildToHtml: true,
  source: 'views',
  output: 'views',
  // 模板入口文件的前缀，入口文件的命名规则为[mainFilePrefix].*.[ext]
  mainFilePrefix: 'index',
  // 是否编译输出静态资源的map文件
  staticSrcmap: false,
  // 静态资源js&css的url是否加上query时间戳
  urlTimestamp: false,
  // favicon路径
  favicon: null,
  // 配置需要编译的模板文件
  // 如果用户不配置，则boi将匹配模板目录下的所有模板文件
  // files: [],

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
  // 图片后缀类型
  ext: ['png', 'jpg', 'gif', 'jpeg'],
  output: 'assets',
  // 是否对小尺寸图片进行base64编码，默认false
  base64: true,
  // 应用base64编码图片的体积临界值，小于此值得图片会被base64编码
  base64Limit: 1000,
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
  default: {
    'basic': DEFAULT_CONFIG_BASIC,
    'js': DEFAULT_CONFIG_JS,
    'style': DEFAULT_CONFIG_STYLE,
    'html': DEFAULT_CONFIG_HTML,
    'image': DEFAULT_CONFIG_IMAGE
  }
};
