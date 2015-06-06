/*eslint no-process-exit:0*/
'use strict';
var gulp = require('gulp');
var runSequence = require('run-sequence');
var $ = require('gulp-load-plugins')();
var mocha = $.mocha;
var istanbul = $.istanbul;
var karma = $.karma;
//var plumber = $.plumber;
var gutil = require('gulp-util');
var chalk = require('chalk');
var args = require('yargs').argv;

var constants = require('../common/constants')();

gulp.task('mocha', 'Runs mocha unit tests.', function() {
    process.env.NODE_ENV = 'mocha';
    return gulp.src(constants.mocha.libs)
        .pipe(istanbul({
            includeUntested: true
        }))
        .pipe(istanbul.hookRequire()) // Force `require` to return covered files
        .on('finish', function() {
            gulp.src(constants.mocha.tests)
                .pipe(mocha({
                    reporter: 'spec',
                    globals: constants.mocha.globals,
                    timeout: constants.mocha.timeout
                }))
                .pipe(istanbul.writeReports({
                    reporters: ['lcov', 'json', 'text', 'text-summary', 'cobertura']
                }))
                .once('end', function() {
                    process.exit();
                });
        });
});

gulp.task('karma', 'Runs karma unit tests.', function() {
    return gulp.src(['no need to supply files because everything is in config file'])
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: args.start ? 'start' : 'run',
            autowatch: !args.start,
            debug: args.debug
        })).on('error', function() {
            gutil.log(chalk.red('(ERROR)'), 'karma');
        });
});

gulp.task('unit', 'Runs all unit tests.', function(done) {
    runSequence(
        'lint',
        'karma',
        'mocha',
        done
    );
});

gulp.task('webdriver-update', false, $.protractor.webdriver_update);

//gulp.task('webdriver-standalone', $.protractor.webdriver_standalone);

gulp.task('e2e', 'Runs e2e tests.', ['webdriver-update'], function(done) {
    var testFiles = [
        'test/e2e/**/*.js'
    ];

    gulp.src(testFiles)
        .pipe($.protractor.protractor({
            configFile: 'protractor.conf.js'
        }))
        .on('error', function(err) {
            // Make sure failed tests cause gulp to exit non-zero
            throw err;
        })
        .on('end', function() {
            // Close connect server to and gulp connect task
            //gulp.server.close();
            done();
        });
});

gulp.task('test', 'Runs all the tests (unit and e2e).', function(done) {
    runSequence(
        'lint',
        'karma',
        'mocha',
        'e2e',
        done
    );
});
