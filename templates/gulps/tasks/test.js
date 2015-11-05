/*eslint no-process-exit:0*/
'use strict';
var gulp = require('gulp');
var runSequence = require('run-sequence');
var mocha = require('gulp-mocha');
var istanbul = require('gulp-istanbul');
var gProtractor = require('gulp-protractor');
var browserSync = require('browser-sync').create();
var bs = browserSync;
var gmux = require('gulp-mux');
var args = require('yargs').argv;
var path = require('path');
var KarmaServer = require('karma').Server;
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
                    dir: './coverage/mocha',
                    reporters: ['lcov', 'json', 'text', 'text-summary', 'cobertura']
                }))
                .once('end', function() {
                    //process.exit();
                    done();
                });
        });
});

gulp.task('karma', 'Runs karma unit tests.', function(done) {
    global.args = args;
    new KarmaServer({
        configFile: path.resolve('karma.conf.js'),
        singleRun: true,
        action: args.start ? 'start' : 'run',
        autowatch: !args.start
    }, done).start();
});

gulp.task('unit', 'Runs all unit tests.', function(done) {
    runSequence(
        'lint',
        'karma',
        'mocha',
        done
    );
});

gulp.task('webdriver-update', false, gProtractor.webdriver_update);
//gulp.task('webdriver-standalone', gProtractor.webdriver_standalone);

var taskE2EServe = function(constants, done) {
    var dest = constants.dist.distFolder;
    dest = helper.isMobile(constants) ? dest + '/www' : dest;
    bs = browserSync.init({
        ui: false,
        minify: false,
        ghostMode: false,
        codeSync: false,
        logLevel: 'silent',
        notify: false,
        open: false,
        port: constants.e2e.port,
        server: {
            baseDir: [dest]
        }
    }, done);
};

var taskE2ERun = function(constants, done) {
    gulp.src(constants.e2e.src)
        .pipe(gProtractor.protractor({
            configFile: constants.e2e.configFile,
            args: ['--coverage=' + require('yargs').argv.coverage, '--target=' + constants.targetName]
        }))
        .on('error', function(err) {
            // Make sure failed tests cause gulp to exit non-zero
            bs.cleanup();
            throw err;
        })
        .on('end', function() {
            // Close connect server to and gulp connect task
            bs.cleanup();
            done();
        });
    gulp.on('stop', process.exit);
};

gulp.task('e2e:run', false, function(done) {
    var taskname = 'e2e:run';
    process.env.PROTRACTOR = true;
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskE2ERun, taskname, global.options.target, global.options.mode, constants, done);
});

gulp.task('e2e:serve', false, function(done) {
    var taskname = 'e2e:serve';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskE2EServe, taskname, global.options.target, global.options.mode, constants, done);
});

var taskE2E = function(constants, done) {
    process.env.PROTRACTOR = true;
    args = require('yargs').default('coverage', true).argv;
    runSequence(
        ['webdriver-update', args.skipDist ? 'wait' : 'dist'],
        'e2e:serve',
        'e2e:run',
        done
    );

};

gulp.task('e2e', 'Runs e2e tests.', function(done) {
    var taskname = 'e2e';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskE2E, taskname, global.options.target, global.options.mode, constants, done);

});

gulp.task('test', 'Runs all the tests (unit and e2e).', function(done) {
    global.webpackQuiet = true;
    runSequence(
        'lint',
        'karma',
        'mocha',
        'e2e',
        done
    );
});
