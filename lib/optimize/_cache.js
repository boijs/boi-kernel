'use strict';

let fs = require('fs');
let path = require('path');
let _ = require('lodash');
let Promise = require('bluebird');

/**
 * 缓存类型
 * @type {Array}
 */
const TYPES = ['file','memory'];
const FILENAME = '.boirc';
const INITIAL_CONTENT = {
    values: {},
    keys: []
};

function createFileCache() {
    let _rc = path.join(process.cwd(),FILENAME);
    Promise.try(()=>{
        return fs.accessSync(_rc,fs.F_OK);
    }).then((stat)=>{
        return;
    }).catch((err) => {
        fs.writeFileSync(FILENAME,JSON.stringify(INITIAL_CONTENT));
    }).then(()=>{
        // console.log('cache file has been created');
    });
}

function getFileCache(){
    let _cache = null;
    let _content = fs.readFileSync(path.join(process.cwd(),FILENAME));
    _cache = JSON.parse(_content.toString());

    return _cache;
}

function setFileCache(content){
    Promise.try(()=>{
        fs.writeFileSync(FILENAME,JSON.stringify(content));
    }).then((stat)=>{
        console.log('set cache successfully');
    }).catch((err)=>{
        throw new Error(err);
    });
}

function cache(type){
    this.type = type || 'file';
    if(_.indexOf(TYPES,this.type)===-1){
        throw new Error('Invalid cache type');
    }
    switch (this.type) {
        case 'file':
            createFileCache();
            break;
        case 'memory':
            break;
        default:
            break;
    }
}

cache.prototype.set = function(key,value){
    if(!key||!value){
        return;
    }
    let _cache = getFileCache();
    if(_.indexOf(_cache.keys,key)===-1){
        _cache.keys.push(key);
    }
    _cache.values[key] = _.assign({},value);
    setFileCache(_cache);
};

cache.prototype.get = function(key){
    if(!key){
        return;
    }
    let _cache = getFileCache();
    if(_.indexOf(_cache.keys,key)!==-1){
        return _cache.values[key];
    }
    return null;
};

cache.prototype.update = function(key,value){
    if(!key||!value){
        return;
    }
    let _cache = getFileCache();
    if(_.indexOf(_cache.keys,key)===-1){
        _cache.set(key,value);
    }else{
        _cache.values[key] = _.assign({},_cache.values[key],value);
    }
    setFileCache(_cache);
};

cache.prototype.delete = function(key){
    if(!key){
        return;
    }
    let _cache = getFileCache();
    if(_.indexOf(_cache.keys,key)===-1){
        return;
    }
    _.pull(_cache.keys,key);
    _.unset(_cache.values,key);
    setFileCache(_cache);
};

cache.prototype.clear = function(){
    setFileCache('');
};

module.exports = cache;
