'use strict';
var gulp = require('gulp');
var browserSync = require('browser-sync');
var runSequence = require('run-sequence');
var gutil = require('gulp-util');
var chalk = require('chalk');
var gmux = require('gulp-mux');
var exec = require('child_process').exec;
var constants = require('../common/constants')();
var helper = require('../common/helper');
var args = require('yargs').argv;
var _ = require('lodash');

var taskBrowsersyncstart = function(constants) {
    var dest = constants.dist.distFolder;
    dest = helper.isMobile(constants) ? dest + '/www' : dest;
    var open = constants.serve.open;
    var https = constants.serve.https || false;
    if (!_.isUndefined(args.browser)) {
        open = args.browser;
    }
    if (!_.isUndefined(args.https)) {
        https = args.https;
    }
    var bs = browserSync.create();
    //var version = helper.readJsonFile('./package.json').version;
    //var target = constants.targetName;
    //var releaseName = target + '-v' + version;
    //var sourceMap = releaseName + constants.exorcist.mapExtension;
    //var sourceMapDest = constants.exorcist.dest;
    var config = {
        files: [dest + '/index.html', dest + '/' + constants.script.dest + '/' + constants.bundleName, dest + '/' + constants.style.dest + '/' + constants.style.destName],
        tunnel: constants.serve.localtunnel,
        server: {
            baseDir: constants.mode === 'prod' ? [dest, constants.exorcist.dest] : dest,
            routes: {},
            middleware: [
                function(req, res, next) {
                    //console.log("Hi from middleware");
                    next();
                }
            ]
        },
        host: constants.serve.host,
        port: constants.serve.port,
        https: https,
        logLevel: 'info', // info, debug , silent
        open: open,
        browser: constants.serve.browser, //['google chrome'], // ['google chrome', 'firefox'],
        notify: true,
        logConnections: false,
        ghostMode: constants.serve.ghostMode
    };

    //config.server.routes['/' + sourceMapDest + '/' + sourceMap] = sourceMapDest + '/' + sourceMap;

    bs.watch(constants.style.watchFolder, {
        ignoreInitial: true
    }, function() {
        gulp.start('style');
    });

    bs.watch(constants.html.src, {
        ignoreInitial: true
    }, function() {
        gulp.start('html');
    });

    bs.watch(constants.images.src, {
        ignoreInitial: true
    }, function() {
        gulp.start('image');
    });

    bs.init(config);

    var platform = global.options.platform || constants.cordova.platform;
    if (helper.isMobile(constants)) {
        gutil.log('Launching ' + platform + ' emulator');
        //exec('ionic emulate ' + platform + ' --livereload', {
        exec('ionic emulate ' + platform, {
            cwd: constants.dist.distFolder,
            maxBuffer: constants.maxBuffer
        }, helper.execHandler);
    }
};

var taskBrowsersync = function(constants) {
    runSequence(
        [constants.moduleManager === 'webpack' ? 'webpack:watch' : 'watchify', 'style', 'image', 'html', 'font', 'angular:i18n'],
        'browsersyncstart'
    );
};

gulp.task('browsersyncstart', false, function() {
    var taskname = 'browsersyncstart';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskBrowsersyncstart, taskname, global.options.target, global.options.mode, constants);
});

gulp.task('browsersync', 'Launches a browserSync server.', function() {
    var taskname = 'browsersync';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskBrowsersync, taskname, global.options.target, global.options.mode, constants);
});

var taskCordovaRun = function(constants) {
    if (!helper.isMobile(constants)) {
        gutil.log(chalk.red('Error: ' + chalk.bold(constants.targetName) + ' is not a cordova application'));
        return;
    }
    var platform = global.options.platform || constants.cordova.platform;
    gutil.log('ionic run ' + platform);
    exec('ionic run ' + platform, {
        cwd: constants.dist.distFolder,
        maxBuffer: constants.maxBuffer
    }, helper.execHandler);
};

gulp.task('cordova:run', 'Execute cordova run', function() {
    var taskname = 'cordova:run';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskCordovaRun, taskname, global.options.target, global.options.mode, constants);

});

gulp.task('bowersync', false, function() {
    gutil.log(chalk.red('\n', 'Task \'bowersync\' is not in your gulpfile.'), '\n', chalk.red('Did you mean this?'), '\n', chalk.yellow('gulp browsersync'), '\n');
});
