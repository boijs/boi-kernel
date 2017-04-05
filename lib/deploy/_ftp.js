'use strict';

const Glob = require('glob');
const FTPClient = require('ftp');
const Log = require('../utils').log;
const Path = require('path');

let ftp = new FTPClient();

function uploadFiles(ftp, srcDir, targetDir) {
  let _srcFiles = Path.posix.join(process.cwd(), srcDir, '**/*.*');
  let _srcPath = Path.posix.join(process.cwd(), srcDir, '/');
  let targetPath = Path.posix.join('/', targetDir, '/');

  let fileSum = 0;
  let fileUploaded = 0;
  Glob(_srcFiles, (err, files) => {
    if (err) {
      Log.error(err);
      ftp.destroy();
      process.exit();
    }
    if (!files || files.length === 0) {
      Log.error('No files found in ' + srcDir);
      ftp.destroy();
      process.exit();
    }
    fileSum = files.length;
    files.forEach(function (file) {
      Log.info('Uploading ' + file + '...');
      let _target = file.replace(_srcPath, targetPath);
      ftp.put(file, _target, false, (err) => {
        if (err) {
          Log.error(err);
          ftp.destroy();
          process.exit();
        }
        Log.info(file + ' has been uploaded');
        fileUploaded++;
        if (fileUploaded >= fileSum) {
          Log.info('All files\' been uploaded');
          ftp.destroy();
          process.exit();
        }
      });
    });
  });
}

module.exports = function (connect, sourceDir) {
  let pathInfo = Path.parse(connect.Path);
  let targetPath = Path.posix.join('/', connect.Path);

  // 连接建立成功后触发
  ftp.on('greeting', () => {
    Log.info('Connection\'s been established');
    Log.info('Validating authentication...');
  });

  // 授权验证成功后触发
  ftp.on('ready', () => {
    Log.info('Authentication\'s been validated');
    Log.info('Reading target path...');

    // 列出目标目录的父级目录，以便查询目标目录是否存在
    ftp.list(pathInfo.dir, false, (err, list) => {
      if (err) {
        Log.error(err.stack);
        ftp.destroy();
        process.exit();
      }
      // 匹配当前目标目录是否存在
      let _dirs = list.filter((item) => {
        return item.name === pathInfo.name && item.type === 'd';
      });

      if (_dirs && _dirs.length !== 0) {
        // 目标目录存在
        uploadFiles(ftp, sourceDir, targetPath);
      } else {
        // 目标目录不存在
        Log.info('Creating \'' + targetPath + '\'...');
        // 创建目标目录
        ftp.mkdir(targetPath, (err) => {
          if (err) {
            Log.error(err.stack);
            ftp.destroy();
            process.exit();
          }
          uploadFiles(ftp, sourceDir, targetPath);
        });
      }
    });
  });
  // error立即关闭联系并终止进程
  ftp.on('error', (err) => {
    Log.error(err.stack);
    ftp.destroy();
    process.exit();
  });
  Log.info('Establishing connection...');
  // 建立连接
  ftp.connect(connect.config);
};
