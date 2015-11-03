'use strict';
var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var transform = require('vinyl-transform');
var exorcist = require('exorcist');
var path = require('path');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var resolutions = require('browserify-resolutions');
var envify = require('envify/custom');
var chalk = require('chalk');
var gmux = require('gulp-mux');
var gulpif = require('gulp-if');
var mkdirp = require('mkdirp');
var del = require('del');
var collapse = require('bundle-collapser/plugin');
var constants = require('../common/constants')();
var helper = require('../common/helper');

var bundleShare = function(b, dest, bundleName, mode, sourceMap, done) {

    var rootUrl = '';
    var basePath = path.join(constants.clientFolder, constants.script.dest);

    b.bundle()
        .on('error', function(err) {
            gutil.beep();
            gutil.log(gutil.colors.red('Browserify failed'));
            gutil.log(gutil.colors.red(err.message));
        })
        .pipe(source(bundleName))
        .pipe(buffer())
        .pipe(gulpif(mode === 'prod', transform(function() {
            // in prod mode we save the source map file in a special folder
            // we first need to make sure the destination folder exists
            mkdirp.sync(constants.exorcist.dest);
            var normalizedURL = helper.resolveSentryNormalizedUrl(constants);
            if (normalizedURL.length > 0) {
                var sourceMapURL = normalizedURL + '/' + sourceMap;
                return exorcist(path.join(constants.exorcist.dest, sourceMap), sourceMapURL, rootUrl, constants.clientFolder);
            } else {
                // when no normalizedURL we copy the source map along with the bundle
                return exorcist(path.join(dest, sourceMap), sourceMap, rootUrl, basePath);
            }
        }), transform(function() {
            // in dev mode we save the source map file along with bundle.js
            // we first need to make sure the destination folder exists
            mkdirp.sync(dest);
            return exorcist(path.join(dest, sourceMap), sourceMap, rootUrl, basePath);
        })))
        .pipe(gulp.dest(dest))
        .on('end', function() {
            if (done) {
                done();
            }
        });
};

var browserifyShare = function(shouldWatch, constants, done) {
    var version = helper.readJsonFile('./package.json').version;
    var dest = constants.dist.distFolder;
    dest = helper.isMobile(constants) ? dest + '/www/' + constants.script.dest : dest + '/' + constants.script.dest;
    var mode = constants.mode;
    var target = constants.targetName;
    var bundleName = constants.bundleName || 'bundle.js';
    var releaseName = target + '-v' + version;
    var sourceMap = releaseName + constants.exorcist.mapExtension;
    var envifyVars = helper.getEnvifyVars(constants);
    // we delete the old sourcemaps if any
    del.sync([dest + '/*' + constants.exorcist.mapExtension]);

    // we need to pass these config options to browserify
    var b = browserify({
        debug: true,
        cache: {},
        packageCache: {},
        fullPaths: mode === 'prod' ? false : true,
        require: ['fs']
    });
    b.plugin(resolutions, '*');
    if (shouldWatch) {
        b = watchify(b);
    }
    if (mode === 'prod') {
        b.transform({
            'global': true,
            'exts': ['.js'],
            'ignore': [
                '**/node_modules/xlsx/**/*'
            ]
        }, 'uglifyify');

        // convert bundle paths to IDSs to save bytes in browserify bundles
        b.plugin(collapse);
    }
    b.transform(envify(envifyVars));
    if (require('yargs').argv.coverage) {
        b.transform(require('browserify-istanbul')({
            instrumenter: require('isparta'),
            ignore: ['**/*.test.js', '**/*.html', '**/bower_components/**', '**/node_modules/**', '**/client/scripts/lbServices.js'],
            defaultIgnore: true
        }));
    }
    b.on('update', function() {
        bundleShare(b, dest, bundleName, mode, sourceMap);
    });

    b.on('log', function(msg) {
        gutil.log(chalk.green('browserify'), msg);
    });

    b.add(constants.browserify.src);
    bundleShare(b, dest, bundleName, mode, sourceMap, done);

};

var taskBrowserify = function(constants, done) {
    browserifyShare(false, constants, done);
};

var taskWatchify = function(constants, done) {
    browserifyShare(true, constants, done);
};

gulp.task('browserify', 'Generates a bundle javascript file with browserify.', function(done) {
    var taskname = 'browserify';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForMultipleTargets(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskBrowserify, taskname, global.options.target, global.options.mode, constants, done);

});

gulp.task('watchify', 'Generates a bundle javascript file with watchify.', function(done) {
    var taskname = 'watchify';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskWatchify, taskname, global.options.target, global.options.mode, constants, done);

});
