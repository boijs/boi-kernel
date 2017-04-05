'use strict';

const Path = require('path');
const SSHClient = require('ssh2').Client;
const Inquirer = require('inquirer');
const Glob = require('glob');
const Log = require('../utils').log;

function doDeploy(sftp, sourcePath, targetPath, sshConn) {
  Glob(Path.join(sourcePath, '**/**.**'), (err, files) => {
    if (err) {
      sshConn.end();
      throw err;
    }

    if (files && files.length > 0) {
      let sum = files.length;
      let count = 0;
      files.forEach(file => {
        let _file = file.replace(sourcePath, '');
        let _fileDirname = Path.parse(_file).dir;
        if (_fileDirname) {
          sftp.exists(Path.join(targetPath, _fileDirname), (isExist) => {
            if (!isExist) {
              // 目录不存在则创建后再upload
              sshConn.exec('mkdir -p ' + Path.join(targetPath, _fileDirname), (err) => {
                if (err) {
                  sshConn.end();
                  throw err;
                }
                sftp.fastPut(file, Path.join(targetPath, _file), err => {
                  if (err) {
                    sshConn.end();
                    throw err;
                  }
                  count++;
                  if (count >= sum) {
                    Log.succeed('Deploy succeed!');
                    sshConn.end();
                    process.exit(1);
                  }
                });
              });
            } else {
              // 目录存在则直接上传
              sftp.fastPut(file, Path.join(targetPath, _file), err => {
                if (err) {
                  sshConn.end();
                  throw err;
                }
                count++;
                if (count >= sum) {
                  Log.succeed('Deploy succeed!');
                  sshConn.end();
                  process.exit(1);
                }
              });
            }
          });
        } else {
          sftp.fastPut(file, Path.join(targetPath, _file), err => {
            if (err) {
              sshConn.end();
              throw err;
            }
            count++;
            if (count >= sum) {
              Log.succeed('Deploy succeed!');
              sshConn.end();
              process.exit(1);
            }
          });
        }
      });
    } else {
      Log.error('No dest files, please run build before deployment.');
      sshConn.end();
    }
  });
}

module.exports = function (connect, sourceDir, appName) {
  let sshConn = new SSHClient();

  sshConn.on('ready', function () {
    sshConn.sftp(function (err, sftp) {
      if (err) {
        sshConn.end();
        throw err;
      }
      // 判断是否存在flag文件，如果不存在则代表是一个新的目录
      sftp.exists(Path.join(connect.path,appName + '.flag'), (isExist) => {
        if (!isExist) {
          Inquirer.prompt([{
            type: 'confirm',
            name: 'confirm',
            message: 'The target directory isn\'t the one of previous deployment, do you still want to deploy your project?'
          }]).then(answer => {
            if (answer && answer.confirm) {
              sshConn.exec('touch '+appName+'.flag',err=>{
                if(err){
                  sshConn.end();
                  throw err;
                }
                doDeploy(sftp, sourceDir, Path.resolve(connect.path), sshConn);
              });
            } else {
              sshConn.end();
              process.exit(1);
            }
          });
        } else {
          doDeploy(sftp, sourceDir, Path.resolve(connect.path), sshConn);
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
