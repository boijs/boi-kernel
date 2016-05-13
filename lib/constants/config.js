'use strict'
const available_patterns = [
    'basic',
    'js',
    'style',
    'html',
    'image'
];
const default_config = {
    // 基础配置，包括编译和部署等相关配置
    'basic': {
        // 项目名称，默认值app
        appName: 'app',
        // 本地编译目录
        localPath: {
            // 源码位置
            src: './src/',
            // 编译目标路径
            dest: './dest/'
        },
        // cdn url
        // cdn: {
        //     server: 'http://static.daojia.com',
        //     path: '/'
        // },
        // 远程部署目录
        deploy: {
            // 远程部署IP
            server: '127.0.0.1',
            // 远程部署目录
            path: '/'
        }
    },
    // javascript编译配置
    'js': {
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
        // uglify: true,

        // 是否compress
        // compress: true,

        // 是否使用hash指纹
        // useHash: true,

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
        // },
        // 部署配置项，同名配置会覆盖上层配置
        deploy: {
            server: '192.168.1.1',
            path: '/static/js/'
        }
    },
    // 样式文件默认配置项
    'style': {
        // 预编译器类型，默认支持sass以及原生css
        extType: 'css',

        // 源码目录，相对于basic.localPath.src
        srcDir: 'style',
        // 编译输入目录，默认和srDir相同
        destDir: 'style',
        // 是否uglify
        // uglify: true,

        // 是否compress
        // compress: true,

        // 是否使用hash指纹
        // useHash: true,

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
        // },

        // 部署配置项，同名配置会覆盖上层配置
        deploy: {
            path: '/static/style/',
        }
    },
    // 模板默认配置项
    html: {
        extType: 'html',
        srcDir: 'views',
        // 编译输入目录，默认和srDir相同
        destDir: 'views',
        // 模板入口文件的前缀，默认为index.*.html
        // mainFilePrefix: 'index',

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
        // },
        // 部署配置项，同名配置会覆盖上层配置
        deploy: {
            path: '/views/',
        }
    },
    // 图片资源默认配置项
    image: {
        // 图片后缀名
        extType: ['png', 'jpg'],

        // 是否对小尺寸图片进行base64编码，默认false
        base64: false,

        // 编译输入目录，默认是image
        destDir: 'image',

        // base64编码的上限值
        base64Limit: 1000,

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
        // },

        // 媒体资源独有的额外配置项
        // 可设置图片与js、style文件部署不同的cdn
        // 此项配置将覆盖basic同名配置项
        // cdn: 'img.daojia.com',
        // 部署配置项，同名配置会覆盖上层配置
        deploy: {
            server: '192.168.1.100',
            path: '/res/image/'
        }
    }
};
module.exports = {
    available_patterns,
    default_config
};
