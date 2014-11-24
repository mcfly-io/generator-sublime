'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var webserver = $.webserver;
var browserSync = require('browser-sync');
var openBrowser = require('open');
var gutil = require('gulp-util');
var chalk = require('chalk');

var constants = require('../common/constants')();

var serverConfig = {
    host: constants.serve.host,
    root: constants.serve.root,
    port: constants.serve.port,
    livereload: constants.serve.livereload,
    localtunnel: constants.serve.localtunnel
};

function browserSyncStart(baseDir) {
    var config = {
        files: [baseDir + '/index.html', baseDir + '/scripts/bundle.js', baseDir + '/styles/main.css'],
        tunnel: true, // or 'my-app',
        server: {
            baseDir: baseDir,
            middleware: [
                function(req, res, next) {
                    //console.log("Hi from middleware");
                    next();
                }
            ]
        },
        host: serverConfig.host,
        port: serverConfig.port,
        logLevel: 'info', // info, debug , silent
        open: false,
        browser: ['google chrome'], // ['google chrome', 'firefox'],
        notify: true,
        logConnections: false
    };

    browserSync(config);
}

gulp.task('serve', 'Launches a livereload server.', ['browserify'<% if (style) { %>, 'style', 'style:watch'<% } %>], function() {
    gulp.src(serverConfig.root)
        .pipe(webserver({
            host: serverConfig.host,
            port: serverConfig.port,
            livereload: {
                enable: true,
                port: serverConfig.livereload
            }
        }));
    //console.log('Started connect web server on http://localhost:' + serverConfig.port + '.');
    openBrowser('http://' + serverConfig.host + ':' + serverConfig.port);
});

gulp.task('browsersync', 'Launches a browserSync server.', ['browserify'<% if (style) { %>, 'style', 'style:watch'<% } %>], function() {
    browserSyncStart(serverConfig.root);
});

gulp.task('bowersync', false, function() {
    gutil.log(chalk.red('\n', 'Task \'bowersync\' is not in your gulpfile.'), '\n', chalk.red('Did you mean this?'), '\n', chalk.yellow('gulp browsersync'), '\n');
});