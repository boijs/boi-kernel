'use strict'

let config = require('./api/config/index.js');

let boli = module.exports = {};

boli.config = config;

//register global variable
Object.defineProperty(global, 'boli', {
    enumerable: true,
    writable: false,
    value: boli
});
