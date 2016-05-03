'use strict'

let gulp = require('gulp');
let jsdoc = require('gulp-jsdoc3');

gulp.task('doc', function(cb) {
    var config = require(__dirname + '/conf.jsdoc.json');
    gulp.src(['README.md', '../lib/**/*.js'], {
        read: false
    }).pipe(jsdoc(config, cb));
});


gulp.task('default', ['doc']);
