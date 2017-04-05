'use strict';

require('shelljs/global');
const Path = require('path');
const Webpack = require('webpack');
const Config = require('../config');
const Log = require('../utils').log;

let build = module.exports = {};

build.run = () => {
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
    let info = stat.toJson();
    if (info.errors.length !== 0) {
      Log.error(info.errors);
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

    /* eslint-disable */
    // 删除sprites临时文件夹
    rm('-rf', '.tmp_sprites');
    /* eslint-enable */

    process.exit(0);
  });
};
