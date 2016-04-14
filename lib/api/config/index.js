/**
* @desc 配置功能
*/
'use strict'

let path = require('path');
// thirdparty tools
let glob = require('glob');
let colors = require('colors/safe');
// webpack plugins
let ExtractTextPlugin = require('extract-text-webpack-plugin')
let UglifyJsPlugin = webpack.optimize.UglifyJsPlugin
let CommonsChunkPlugin = webpack.optimize.CommonsChunkPlugin

const DEFAULT_CONFIG = require('./config.default.js');
const _ = require('../utils/index.js');

const PATTERNS = [
'src',
'dest',
'deploy',
'js',
'css',
'image',
'tpl'
];

let _conf = {};

// 判断是否是可用的配置项
function isValidPattern(pattern){
    return !!PATTERNS.indexOf(pattern);
}

let config = module.exports = function(conf){
    if(!conf || !_.isPureObject(conf)){
        return;
    }
    _conf = Object.assign({},DEFAULT_CONFIG,conf);
};
/**
* 细化配置项API
* @param {string} pattern - 配置模块
* @param {object} options - 配置项
*/ 
config.spec = function(pattern,options){
    if(!pattern || !_.isPureString(pattern) || !option || _.isPureObject(options)){
        console.log(colors.red('Invalid configuration!'));
        return;
    }
    if(isValidPattern(pattern)){
        // 覆盖同名配置项
        let __conf = {};
        __conf[pattern] = Object.assign({},_conf[patttern],options);
        _conf = Object.assign({},_conf,__conf);
    }
};
/**
* 生成webpack配置文件
*/ 
config.generateConfFile = function(){
    let _entries = (()=>generateEntries());
};

function generateEntries(){
    let _entries = {};
    let _jsDir = path.resolve(process.cwd(),_conf.src.dirname,_conf.js.dirname);
    let _jsEntries = glob.sync(_jsDir,'/main.*.'+_conf.js.ext);
    _jsEntries.forEach((filePath) => {
        let _filename = filePath.substring(filePath.lastIndexOf('\/') + 1, filePath.lastIndexOf('.'))
        _entries[filename] = filePath;
    });
    return _entries;
}