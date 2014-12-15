'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var es = require('event-stream');
var sass = $.sass;
//var sourcemaps = $.sourcemaps;
var autoprefixer = $.autoprefixer;
var rename = $.rename;
var concat = $.concat;
var size = $.size;
var minifycss = require('gulp-minify-css');
var constants = require('../common/constants')();
var gmux = require('gulp-mux');

var taskFonts = function(constants) {
    return gulp.src(constants.fonts.src)
        .pipe(gulp.dest(constants.fonts.dest))
        .pipe($.size({
            title: 'fonts:' + constants.targetName
        }));
};

gulp.task('fonts', 'Copy fonts.', function(done) {
    var taskname = 'fonts';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForMultipleTargets(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskFonts, taskname, global.options.target, global.options.mode, constants, done);
});

var taskStyle = function(constants) {
    var sassFiles = gulp.src(constants.style.sass.src)
        //.pipe(sourcemaps.init())
        .pipe(sass());
    //.pipe(sourcemaps.write());

    var cssFiles = gulp.src(constants.style.css.src);

    return es.concat(cssFiles, sassFiles)
        //.pipe(sourcemaps.init({
        //    loadMaps: true
        //}))
        .pipe(concat(constants.style.destName))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        //.pipe(sourcemaps.write())
        .pipe(gulp.dest(constants.style.dest))
        .pipe($.size({
            title: 'css files',
            showFiles: true
        }))
        .pipe(minifycss())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe($.size())
        .pipe(gulp.dest(constants.style.dest))
        .pipe(size({
            title: 'css files:' + constants.targetName,
            showFiles: true
        }));
};

gulp.task('style', 'Generates a bundle css file.', ['fonts'], function() {
    var taskname = 'style';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForMultipleTargets(taskname);
    }
    gmux.createAndRunTasks(gulp, taskStyle, taskname, global.options.target, global.options.mode, constants);
});

var taskStyleWatch = function(constants) {
    gulp.watch(constants.style.src, ['style']);
};

gulp.task('style:watch', 'Watch changes for style files.', function() {

    var taskname = 'style:watch';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    gmux.createAndRunTasks(gulp, taskStyleWatch, taskname, global.options.target, global.options.mode, constants);
});
