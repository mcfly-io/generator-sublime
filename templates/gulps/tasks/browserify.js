'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var watchify = require('watchify');
var browserify = require('browserify');
var chalk = require('chalk');
var gmux = require('gulp-mux');
var constants = require('../common/constants')();

var bundleShare = function(b, dest, bundleName) {
    var bundle = b.bundle();
    bundle
        .on('error', function(err) {
            gutil.log(chalk.red('Browserify failed', '\n', err.message));
            bundle.end();
        })
        .pipe(source(bundleName))
        .pipe(gulp.dest(dest));
};

var browserifyShare = function(singleRun, src, dest, bundleName) {
    bundleName = bundleName || 'bundle.js';
    // we need to pass these config options to browserify
    var b = browserify({
        debug: true,
        cache: {},
        packageCache: {},
        fullPaths: true
    });
    if(singleRun) {
        b = watchify(b);
    }
    b.on('update', function() {
        bundleShare(b, dest, bundleName);
    });

    b.on('log', function(msg) {
        gutil.log(chalk.green('browserify'), msg);
    });

    b.add(src);
    bundleShare(b, dest, bundleName);

};

var taskBrowserify = function(constants) {
    browserifyShare(false, constants.browserify.src, constants.browserify.dest, constants.browserify.bundleName);
};

var taskWatchify = function(constants) {
    browserifyShare(true, constants.browserify.src, constants.browserify.dest, constants.browserify.bundleName);
};

gulp.task('browserify', 'Generates a bundle javascript file with browserify.', function(done) {
    var taskname = 'browserify';
    gmux.targets.setClientFolder(constants.clientFolder);
    if(global.options === null) {
        global.options = gmux.targets.askForMultipleTargets(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskBrowserify, taskname, global.options.target, global.options.mode, constants, done);

});

gulp.task('watchify', 'Generates a bundle javascript file with watchify.', function(done) {
    var taskname = 'watchify';
    gmux.targets.setClientFolder(constants.clientFolder);
    if(global.options === null) {
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskWatchify, taskname, global.options.target, global.options.mode, constants, done);

});
