/*eslint handle-callback-err:0,consistent-return:0*/
'use strict';
var gulp = require('gulp');
var exec = require('child_process').exec;
var gmux = require('gulp-mux');
var runSequence = require('run-sequence');
var constants = require('../common/constants')();
var helper = require('../common/helper');
var gutil = require('gulp-util');
var chalk = require('chalk');
var path = require('path');

var taskSentry = function(constants, done) {
    var version = helper.readJsonFile('./package.json').version;
    var target = constants.targetName;
    var appname = constants.appname;
    var slug = (appname + '-' + target).toLowerCase();
    var releaseName = target + '-v' + version;
    var srcmapPath = path.join(constants.exorcist.dest, releaseName + '.map.js');
    // var srcmapURL = releaseName + '.map.js';
    var srcmapURL = constants.sentry.normalizedURL + '/' + srcmapPath;
    var bundleDest = constants.dist.distFolder;
    bundleDest = helper.isMobile(constants) ? bundleDest + '/www' : bundleDest;
    var bundlePath = path.join(bundleDest, constants.browserify.dest, constants.browserify.bundleName);
    // var bundleURL = 'bundle.js';
    var bundleURL = constants.sentry.normalizedURL + '/' + releaseName + '/bundle.js';

    var sentryURL = 'https://app.getsentry.com/api/0/projects/' + constants.sentry.organizationName;

    var curlClear = 'curl ' + sentryURL + '/' + slug + '/releases/' + releaseName + '/ ' +
        ' -X DELETE' +
        ' -u ' + constants.sentry.auth;

    var curlRelease = 'curl ' + sentryURL + '/' + slug + '/releases/ ' +
        ' -X POST' +
        ' -u ' + constants.sentry.auth +
        ' -d \'{"version": "' + releaseName + '"}\'' +
        ' -H "Content-Type: application/json"';

    var curlSrcmap = 'curl ' + sentryURL + '/' + slug + '/releases/' + releaseName + '/files/' +
        ' -X POST' +
        ' -u ' + constants.sentry.auth +
        ' -F file=@' + srcmapPath +
        ' -F name=' + srcmapURL +
        ' -H "Content-Type: multipart/form-data"';

    var curlBundle = 'curl ' + sentryURL + '/' + slug + '/releases/' + releaseName + '/files/' +
        ' -X POST' +
        ' -u ' + constants.sentry.auth +
        ' -F file=@' + bundlePath +
        ' -F name=' + bundleURL +
        ' -H "Content-Type: multipart/form-data"';
    var execHandler = function(err, stdout, stderr, title, curlString) {
        if(err) {
            //helper.execHandler(err);
            gutil.log(chalk.red('An error occured executing a command line action'));
        } else if(stdout === '{"detail": ""}') {
            gutil.log(chalk.red('Failed: ' + title));
            gutil.log('Curl command:\n' + curlString);
        } else {
            gutil.log('Suceeded: ' + title);
        }
    };
    exec(curlClear, {
        cwd: constants.cwd
    }, function(err, stdout, stderr) {
        execHandler(err, stdout, stderr, 'clear release ' + chalk.yellow(releaseName), curlClear);
        exec(curlRelease, {
            cwd: constants.cwd
        }, function(err, stdout, stderr) {
            execHandler(err, stdout, stderr, 'create release ' + chalk.yellow(releaseName), curlRelease);
            exec(curlSrcmap, {
                cwd: constants.cwd
            }, function(err, stdout, stderr) {
                execHandler(err, stdout, stderr, 'upload sourcemap ' + chalk.green(srcmapPath) + ' for release ' + chalk.yellow(releaseName), curlSrcmap);
                exec(curlBundle, {
                    cwd: constants.cwd
                }, function(err, stdout, stderr) {
                    execHandler(err, stdout, stderr, 'upload bundle ' + chalk.green(bundlePath) + ' for release ' + chalk.yellow(releaseName), curlBundle);
                    done();
                });
            });
        });
    });
};

var checkSentryConfig = function(constants) {
    var checkConfig = function(keyValue, keyName) {
        if(!keyValue || keyValue.length <= 0) {
            gutil.log(gutil.colors.red('The constant ' + keyName + ' is missing or empty in gulp_tasks/common/constants.js'));
            return false;
        }
        return true;
    };
    var configOK = checkConfig(constants.sentry.auth, 'sentry.auth') &&
        checkConfig(constants.sentry.organizationName, 'sentry.organizationName') &&
        checkConfig(constants.sentry.targetKeys[constants.targetName], 'sentry.targetKeys.' + constants.targetName);

    return configOK;
};

gulp.task('sentry:upload', false, function(done) {
    var taskname = 'sentry:upload';
    gmux.targets.setClientFolder(constants.clientFolder);
    if(global.options === null) {
        global.options = gmux.targets.askForMultipleTargets(taskname, {
            mode: 'prod'
        });
    } else {
        global.options.mode = 'prod';
    }
    var configOK = true;
    global.options.target.forEach(function(target) {
        var targetObject = helper.targetToTemplateData(target, global.options.mode);
        var resolvedConstants = gmux.resolveConstants(constants, targetObject);
        configOK = configOK && checkSentryConfig(resolvedConstants);

    });
    if(!configOK) {
        return;
    }
    return gmux.createAndRunTasksSequential(gulp, taskSentry, taskname, global.options.target, global.options.mode, constants, done);
});

gulp.task('sentry', 'dist and upload bundles and sourcemaps to sentry.', function(done) {
    var runSeq = runSequence.use(gulp);
    var taskname = 'sentry';
    if(global.options === null) {
        global.options = gmux.targets.askForMultipleTargets(taskname, {
            mode: 'prod'
        });
    } else {
        global.options.mode = 'prod';
    }
    var configOK = true;
    global.options.target.forEach(function(target) {
        var targetObject = helper.targetToTemplateData(target, global.options.mode);
        var resolvedConstants = gmux.resolveConstants(constants, targetObject);
        configOK = configOK && checkSentryConfig(resolvedConstants);

    });
    if(!configOK) {
        return;
    }
    runSeq('dist', 'sentry:upload', done);
});
