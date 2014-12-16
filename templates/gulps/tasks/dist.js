'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var rename = $.rename;
var del = require('del');
var gmux = require('gulp-mux');
var runSequence = require('run-sequence');
var constants = require('../common/constants')();

var taskClean = function(constants) {
    del([constants.dist.distFolder]);
};

gulp.task('clean', 'Clean distribution folder.', function(done) {
    var taskname = 'clean';
    gmux.targets.setClientFolder(constants.clientFolder);
    if(global.options === null) {
        global.options = gmux.targets.askForMultipleTargets(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskClean, taskname, global.options.target, global.options.mode, constants, done);
});

var taskHtml = function(constants) {
    gulp.src(constants.html.src)
        .pipe(rename('index.html'))
        .pipe(gulp.dest(constants.dist.distFolder));
};

var taskImages = function(constants) {
    gulp.src(constants.images.src, {
            base: constants.clientFolder
        })
        .pipe(gulp.dest(constants.dist.distFolder));
};

gulp.task('html', function() {
    var taskname = 'html';
    gmux.targets.setClientFolder(constants.clientFolder);
    if(global.options === null) {
        global.options = gmux.targets.askForMultipleTargets(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskHtml, taskname, global.options.target, global.options.mode, constants);
});

var taskHtmlWatch = function(constants) {
    gulp.watch(constants.html.src, ['html']);
};

gulp.task('html:watch', 'Watch changes for html index file.', function() {

    var taskname = 'html:watch';
    gmux.targets.setClientFolder(constants.clientFolder);
    if(global.options === null) {
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    gmux.createAndRunTasks(gulp, taskHtmlWatch, taskname, global.options.target, global.options.mode, constants);
});

gulp.task('images', function() {
    var taskname = 'images';
    gmux.targets.setClientFolder(constants.clientFolder);
    if(global.options === null) {
        global.options = gmux.targets.askForMultipleTargets(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskImages, taskname, global.options.target, global.options.mode, constants);
});

gulp.task('dist', 'Distribute the application.', function(done) {
    return runSequence('clean', 'html', 'images', 'browserify', 'style', done);
});

gulp.task('clean:all', 'Clean distribution folder for all targets and modes.', function() {
    var taskname = 'clean:all';
    gmux.targets.setClientFolder(constants.clientFolder);
    var targets = gmux.targets.getAllTargets();
    gmux.createAndRunTasks(gulp, taskClean, taskname, targets, 'dev', constants);
    gmux.createAndRunTasks(gulp, taskClean, taskname, targets, 'prod', constants);
});
