'use strict';
var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
// var uglify = require('gulp-uglify');
var transform = require('vinyl-transform');
var exorcist = require('exorcist');
var path = require('path');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var chalk = require('chalk');
var gmux = require('gulp-mux');
var gulpif = require('gulp-if');
var collapse = require('bundle-collapser/plugin');
var constants = require('../common/constants')();
var helper = require('../common/helper');
var version = helper.readJsonFile('./package.json').version;

var bundleShare = function(b, dest, bundleName, mode, target, done) {
    var bundle = b;
    if(mode === 'prod') {
        bundle.plugin(collapse);
    }
    bundle
        .bundle()
        .on('error', function(err) {
            gutil.beep();
            gutil.log(gutil.colors.red('Browserify failed'));
            gutil.log(gutil.colors.red(err.message));
            // if(err.filename) {
            //     gutil.log(gutil.colors.red(err.filename + ':' + err.loc.line + ':' + err.loc.column));
            // }
        })
        .pipe(source(bundleName))
        .pipe(buffer())
        .pipe(gulpif(mode === 'prod', transform(function() {
            return exorcist(path.join(constants.exorcist.dest, target + '.' + bundleName + '.' + version + '.map'), target + '.' + bundleName + '.' + version + '.map', '', path.join(constants.cwd));
        })))
        // .pipe(gulpif(mode === 'prod', uglify()))
        .pipe(gulp.dest(dest));
};

var browserifyShare = function(shouldWatch, src, dest, bundleName, mode, target, done) {
    bundleName = bundleName || 'bundle.js';
    // we need to pass these config options to browserify
    var b = browserify({
        debug: true,
        cache: {},
        packageCache: {},
        fullPaths: mode === 'prod' ? false : true
    });

    if(shouldWatch) {
        b = watchify(b);
    }
    if(mode === 'prod') {
        b.transform({
            'global': true,
            'exts': ['.js']
        }, 'uglifyify');
    }
    b.on('update', function() {
        bundleShare(b, dest, bundleName, mode);
    });

    b.on('log', function(msg) {
        gutil.log(chalk.green('browserify'), msg);
    });

    b.add(src);
    bundleShare(b, dest, bundleName, mode, target, done);

};

var taskBrowserify = function(constants, done) {
    //browserifyShare(false, constants.browserify.src, constants.browserify.dest, constants.browserify.bundleName, constants.mode);

    var dest = constants.dist.distFolder;
    dest = helper.isMobile(constants) ? dest + '/www/' + constants.browserify.dest : dest + '/' + constants.browserify.dest;
    browserifyShare(false, constants.browserify.src, dest, constants.browserify.bundleName, constants.mode, constants.targetName, done);

};

var taskWatchify = function(constants, done) {
    //browserifyShare(true, constants.browserify.src, constants.browserify.dest, constants.browserify.bundleName, constants.mode);

    var dest = constants.dist.distFolder;
    dest = helper.isMobile(constants) ? dest + '/www/' + constants.browserify.dest : dest + '/' + constants.browserify.dest;
    browserifyShare(true, constants.browserify.src, dest, constants.browserify.bundleName, constants.mode, constants.targetName, done);

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
