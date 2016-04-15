'use strict'

let config = require('./api/config/index.js');

let bolshoi = module.exports = {};

bolshoi.config = config;

//register global variable
Object.defineProperty(global, 'bolshoi', {
    enumerable : true,
    writable : false,
    value : bolshoi
});

