'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var karma = $.karma;
var gutil = require('gulp-util');
var chalk = require('chalk');

gulp.task('karma', function() {
    gulp.src(['no need to supply files because everything is in config file'])
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'run'
        })).on('error', function() {
            gutil.log(chalk.red('(ERROR)'), 'karma');
        });
});