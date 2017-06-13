'use strict';

require('shelljs/global');
const Path = require('path');
const Webpack = require('webpack');
const Config = require('../config');
const Log = require('../utils').log;

module.exports = {
  run: () => {
    let webpackConfig = Config.generateWebpackConfig();
    let boiConfig = Config.getBoiConfig();

    /* eslint-disable */
    // 删除旧文件
    rm('-rf', Path.resolve(boiConfig.basic.output));
    /* eslint-enable */

    Webpack(webpackConfig).run((err, stat) => {
      if (err) {
        Log.error(err.stack);
        process.exit(1);
      }
      const Stats = stat.toJson();
      if (Stats.errors.length !== 0) {
        Log.error(Stats.errors);
        process.exit(1);
      }
      // 输出构建结果
      process.stdout.write(stat.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
      }) + '\n');
      Log.succeed('Build successfully!');

      process.exit(0);
    });
  }
};
