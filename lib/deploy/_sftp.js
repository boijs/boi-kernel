'use strict';

const _ = require('lodash');
const Path = require('path');
const Inquirer = require('inquirer');
const Glob = require('glob');
const Table = require('cli-table2');
const Log = require('../utils').log;
const Promise = require('bluebird');
const SSHClient = require('ssh2').Client;

const IsWindows = process.platform === 'win32';

/**
 * @desc 执行部署
 * @param  {Object}   sftp       sftp实例
 * @param  {String}   sourcePath 本地待部署文件目录-绝对路径
 * @param  {String}   targetPath 部署目标机器路径-绝对路径
 * @param  {Object}   sshConn    ssh client实例
 * @param  {String}   host       目标host
 * @param  {Function} callback   回调函数
 */
function doDeploy(sftp, sourcePath, targetPath, sshConn, host, callback) {
  Glob(Path.join(sourcePath, '**/**.**'), (err, files) => {
    if (err) {
      sshConn.end();
      throw err;
    }
    if (files && files.length > 0) {
      let sum = files.length;
      let count = 0;
      let chars = IsWindows ? {
        'top': '-',
        'top-mid': '-',
        'top-left': ' ',
        'top-right': ' ',
        'bottom': '-',
        'bottom-mid': '-',
        'bottom-left': ' ',
        'bottom-right': ' ',
        'left': '|',
        'left-mid': '|',
        'mid': '-',
        'mid-mid': '|',
        'right': '|',
        'right-mid': '|',
        'middle': '|'
      } : {
        'top': '═',
        'top-mid': '╤',
        'top-left': '╔',
        'top-right': '╗',
        'bottom': '═',
        'bottom-mid': '╧',
        'bottom-left': '╚',
        'bottom-right': '╝',
        'left': '║',
        'left-mid': '╟',
        'right': '║',
        'right-mid': '╢'
      };
      // 命令行表格
      let cliTable = new Table({
        head: [`Source: ${sourcePath}`, `Target: ${host}`],
        chars: chars,
        style: {
          head: ['cyan', 'bold']
        }
      });

      files.forEach(file => {
        let _file = file.replace(sourcePath, '');
        let _fileDirname = Path.parse(_file).dir;
        let _targetDirname = Path.posix.join(targetPath, _fileDirname);
        let _targetFile = Path.posix.join(targetPath, _file);

        new Promise((resolve, reject) => {
          sftp.exists(_targetDirname, (isExist) => {
            if (isExist) {
              resolve(true);
            } else {
              reject();
            }
          });
        }).catch(() => {
          return new Promise((resolve) => {
            sshConn.exec(`mkdir -p ${_targetDirname}`, (err, stream) => {
              if (err) {
                throw err;
              }
              stream.on('end', () => {
                resolve(true);
              }).on('data', () => {});
            });
          });
        }).then((status) => {
          if (status) {
            sftp.fastPut(file, _targetFile, err => {
              if (err) {
                throw err;
              }
              cliTable.push([_file, _targetFile]);
              count++;
              if (count >= sum) {
                /* eslint-disable */
                console.log(cliTable.toString());
                /* eslint-enable */
                Log.succeed('Deploy succeed!');
                if (callback && _.isFunction(callback)) {
                  callback();
                } else {
                  sshConn.end();
                  process.exit(1);
                }
              }
            });
          }
        }).catch(err => {
          sshConn.end();
          throw err;
        });
      });
    } else {
      Log.error('No dest files, please run build before deployment.');
      sshConn.end();
    }
  });
}

/**
 * @module
 * @desc sftp部署功能模块
 * @param  {Object} connect   sftp连接配置项
 * @param  {String} sourceDir 本地待部署文件目录
 * @param  {String} appName   项目名称
 */
module.exports = function (connect, sourceDir, appName) {
  let sshConn = new SSHClient();

  let sourcePath = IsWindows ? sourceDir.replace(/\\/g, '/') : sourceDir;
  // let targetPath = IsWindows?

  sshConn.on('ready', function () {
    sshConn.sftp(function (err, sftp) {
      if (err) {
        sshConn.end();
        throw err;
      }
      let _flagFile = Path.posix.join(connect.path, appName + '.flag');
      // 判断是否存在flag文件，如果不存在则代表是一个新的目录
      sftp.exists(_flagFile, (isExist) => {
        if (!isExist) {
          Inquirer.prompt([{
            type: 'confirm',
            name: 'confirm',
            message: 'The target directory isn\'t the one of previous deployment, do you still want to deploy your project?'
          }]).then(answer => {
            if (answer && answer.confirm) {
              doDeploy(sftp, sourcePath, Path.posix.join('/', connect.path),
                sshConn, connect.host, () => {
                  sshConn.exec(`touch ${_flagFile}`, err => {
                    if (err) {
                      sshConn.end();
                      throw err;
                    }
                    sshConn.end();
                    process.exit(1);
                  });
                });
            } else {
              sshConn.end();
              process.exit(1);
            }
          });
        } else {
          doDeploy(sftp, sourcePath, Path.posix.join('/', connect.path), sshConn,
            connect.host);
        }
      });
    });
  });
  // 连接
  sshConn.connect({
    host: connect.host,
    port: connect.port || 22,
    username: connect.auth && connect.auth.username,
    password: connect.auth && connect.auth.password
  });
};
