var path = require('path');


module.exports = {
    entry: {
        'main.a': '/Users/junpeng/Work/daojia/boli-example/app/suyun/src/js/main.a.js',
        // 'main.b': '/Users/junpeng/Work/daojia/boli-example/app/suyun/src/js/main.b.js',
        // 'main.d': '/Users/junpeng/Work/daojia/boli-example/app/suyun/src/js/test/main.d.js'
    },
    output: {
        path: '/Users/junpeng/Work/daojia/boli-example/app/suyun/dest/js',
        filename: '[name].[chunkhash:8].js'
    },
    resolve: {
        root: [
            path.resolve(__dirname)
        ],
        modulesDirectories: ["node_modules"]
    },
    module: {
        loaders: [{
            test: /\.js?$/,
            loader: 'babel',
            query: {
                presets: [
                    "stage-0",
                    'es2015'
                ],
                // cacheDirectory: true,
                // plugins: ['syntax-object-rest-spread']
            }
        }]
    },

    // resolveLoader: {
    //     modulesDirectories: ["web_loaders", "web_modules", "node_loaders", "node_modules"],
    //     extensions: ["", ".webpack-loader.js", ".web-loader.js", ".loader.js", ".js"],
    //     packageMains: ["webpackLoader", "webLoader", "loader", "main"]
    // }

};
// console.log(path.resolve(__dirname));
