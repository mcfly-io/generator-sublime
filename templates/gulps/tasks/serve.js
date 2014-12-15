'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var webserver = $.webserver;
var browserSync = require('browser-sync');
var openBrowser = require('open');
var runSequence = require('run-sequence');
var gutil = require('gulp-util');
var chalk = require('chalk');
var gmux = require('gulp-mux');
var constants = require('../common/constants')();

var taskBrowsersyncstart = function(constants) {
    var config = {
        files: [constants.serve.root + '/index.html', constants.serve.root + '/scripts/bundle.js', constants.serve.root + '/styles/main.css'],
        tunnel: constants.serve.localtunnel,
        server: {
            baseDir: constants.serve.root,
            middleware: [
                function(req, res, next) {
                    //console.log("Hi from middleware");
                    next();
                }
            ]
        },
        host: constants.serve.host,
        port: constants.serve.port,
        logLevel: 'info', // info, debug , silent
        open: false,
        browser: ['google chrome'], // ['google chrome', 'firefox'],
        notify: true,
        logConnections: false
    };

    browserSync(config);
};
var taskBrowsersync = function(constants) {
    runSequence(
        ['watchify'<% if (style) { %>, 'style', 'style:watch', 'images', 'html', 'html:watch'<% } %>],
        'browsersyncstart'
    );
};

gulp.task('browsersyncstart', false, function() {
    var taskname = 'browsersyncstart';
    gmux.targets.setClientFolder(constants.clientFolder);
    if(global.options === null) {
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskBrowsersyncstart, taskname, global.options.target, global.options.mode, constants);
});

gulp.task('browsersync', 'Launches a browserSync server.', function() {
    var taskname = 'browsersync';
    gmux.targets.setClientFolder(constants.clientFolder);
    if(global.options === null) {
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskBrowsersync, taskname, global.options.target, global.options.mode, constants);
});

gulp.task('bowersync', false, function() {
    gutil.log(chalk.red('\n', 'Task \'bowersync\' is not in your gulpfile.'), '\n', chalk.red('Did you mean this?'), '\n', chalk.yellow('gulp browsersync'), '\n');
});
