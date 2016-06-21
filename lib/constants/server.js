'use strict'

const DEFAULT_CONFIG = {
    domain: 'localhost',
    port: '8888',
    devServerConfig: {
        // display no info to console (only warnings and errors)
        noInfo: false,

        // display nothing to the console
        quiet: false,

        // switch into lazy mode
        // that means no watching, but recompilation on every request
        // lazy: true,

        // watch options (only lazy: false)
        // watchOptions: {
        //     aggregateTimeout: 300,
        //     poll: true
        // },

        // public path to bind the middleware to
        // use the same as in webpack
        // publicPath: "/",

        // custom headers
        // headers: {
        //     "X-Custom-Header": "yes"
        // },

        // options for formating the statistics
        stats: {
            colors: true,
            chunks: false
        }
    }
};

module.exports = {
    DEFAULT_CONFIG
};
