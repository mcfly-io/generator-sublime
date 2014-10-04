'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var sass = $.sass;
var sourcemaps = $.sourcemaps;
var constants = require('../common/constants')();

gulp.task('sass', function() {
    return gulp.src(constants.sass.src)
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(constants.sass.dest));

});