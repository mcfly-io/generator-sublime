/*eslint no-process-exit:0*/
'use strict';
var gulp = require('gulp');
var runSequence = require('run-sequence');
var $ = require('gulp-load-plugins')();
var mocha = $.mocha;
var istanbul = $.istanbul;
var karma = $.karma;
var browserSync = require('browser-sync');
//var plumber = $.plumber;
var gmux = require('gulp-mux');
var gutil = require('gulp-util');
var chalk = require('chalk');
var args = require('yargs').argv;

var constants = require('../common/constants')();
var helper = require('../common/helper');

gulp.task('mocha', 'Runs mocha unit tests.', function(done) {
    process.env.NODE_ENV = 'mocha';
    gulp.src(constants.mocha.libs)
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
                    //process.exit();
                    done();
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

var taskE2EServe = function(constants, done) {
    var dest = constants.dist.distFolder;
    dest = helper.isMobile(constants) ? dest + '/www' : dest;
    browserSync({
        logLevel: 'silent',
        notify: false,
        open: false,
        port: constants.e2e.port,
        server: {
            baseDir: [dest]
        },
        ui: false
    }, done);
};

var taskE2ERun = function(constants, done) {
    gulp.src(constants.e2e.src)
        .pipe($.protractor.protractor({
            configFile: constants.e2e.configFile
        }))
        .on('error', function(err) {
            // Make sure failed tests cause gulp to exit non-zero
            browserSync.exit();
            throw err;
        })
        .on('end', function() {
            // Close connect server to and gulp connect task
            browserSync.exit();
            done();
        });
};

gulp.task('e2e:run', false, function(done) {
    var taskname = 'e2e:run';
    gmux.targets.setClientFolder(constants.clientFolder);
    if(global.options === null) {
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskE2ERun, taskname, global.options.target, global.options.mode, constants, done);
});

gulp.task('e2e:serve', false, function(done) {
    var taskname = 'e2e:serve';
    gmux.targets.setClientFolder(constants.clientFolder);
    if(global.options === null) {
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskE2EServe, taskname, global.options.target, global.options.mode, constants, done);
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

gulp.task('e2e', 'Runs e2e tests.', function(done) {
    runSequence(
        ['webdriver-update', 'dist'],
        'e2e:serve',
        'e2e:run',
        done
    );
});
