'use strict';

let _ = require('lodash');

let merge = function(origin,source){
  let result = Object.assign({},origin);
  for(let key in source){
    if(!_.isUndefined(origin[key])){
      if(_.isPlainObject(origin[key])){
        result[key] = merge(origin[key],source[key]);
      }else if(_.isArray(origin[key])){
        result[key] = origin[key].concat(source[key]);
      }else{
        result[key] = source[key];
      }
    }else{
      throw new Error('Invalid params');
      process.exit();
    }
  }
  return result;
};

module.exports = merge;
