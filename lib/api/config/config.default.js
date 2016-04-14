module.exports = {
    // 源码文件目录
    src: {
        dirname: './src/'
    },
    // 本地release目录
    dest: {
        // 目录
        dirname: './dest',
    },
    // 远程部署配置项
    deploy: {
        // 远程服务器
        server: 'static.daojia.com',
        // 服务器部署目录
        dirname: '/sunyun/resource'
    },
    // js构建配置
    js: {
        // 源码目录，以src的dirname为父级目录
        dirname: 'js',
        // 文件扩展名
        ext: '{js,es,jsx}',
        // 入口文件列表，key为编译目标文件名，value为源文件名
        // main: {
        //     a: 'main.a',
        //     b: 'main.b'
        // },
        // 不参与main打包的文件列表，一般为异步请求的模块
        chunk: {
            'c': 'part/c'
        },
        // 是否转译
        isTransfer: true,
        // 客户端模块化方案，默认webpack
        moduleType: 'amd',
        // 是够压缩
        minify: true,
        // 是否使用hash指纹
        useHash: true,
        // 部署配置项，同名配置会覆盖上层配置
        deploy: {
            dirname: '/suyun/resource/javascript'
        }
    },
    css: {
        dirname: 'css',
        ext: 'scss',
        main: {
            a: 'main.a',
            b: 'main.b'
        },
        minify: true,
        useHash: true
    },
    image: {
        minify: true,
        base64: true,
        base64Limit: 1000
    },
    tpl: {
        diname: 'tpl',
        deploy: {
            server: 'daojia.com',
            dirname: '/suyun/views'
        }
    }
};