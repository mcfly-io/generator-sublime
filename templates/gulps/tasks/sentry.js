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
var _ = require('lodash');

var execHandler = function(err, stdout, stderr, title, curlString) {
    helper.execHandler(err, stdout, stderr);
    if (stdout === '{"detail": ""}') {
        gutil.log(chalk.red('Failed: ' + title));
        gutil.log('Curl command:\n' + curlString);
    }
};

var checkSentryConfig = function(constants) {
    var checkConfig = function(keyValue, keyName) {
        if (!keyValue || keyValue.length <= 0) {
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

var taskSentryDeleteAllErrors = function(constants) {
    var target = constants.targetName;
    var appname = constants.appname;
    var slug = (appname + '-' + target).toLowerCase();

    var sentryURL = 'https://app.getsentry.com/api/0/projects/' + constants.sentry.organizationName;

    var curlList = 'curl ' + sentryURL + '/' + slug + '/groups/?query= ' +
        ' -X GET' +
        ' -u ' + constants.sentry.auth;

    var curlDeleteGroup = 'curl ' +
        ' -X DELETE' +
        ' -u ' + constants.sentry.auth +
        ' https://app.getsentry.com/api/0/groups/';

    exec(curlList, {
        cwd: constants.cwd,
        maxBuffer: constants.maxBuffer
    }, function(err, stdout, stderr) {
        execHandler(err, stdout, stderr, 'list sentry error aggregates in project ' + chalk.yellow(target), curlList);
        if (!stdout) {
            return;
        }
        _(JSON.parse(stdout))
            .forEach(function(agg) {
                var curl = curlDeleteGroup + agg.id + '/';
                exec(curl, {
                    cwd: constants.cwd,
                    maxBuffer: constants.maxBuffer
                }, function(err, stdout, stderr) {
                    execHandler(err, stdout, stderr, 'delete group ' + chalk.green(agg.id) + ' in project ' + chalk.yellow(target), curl);
                });
            })
            .value();
    });
};

var taskSentry = function(constants, done) {
    var version = helper.readJsonFile('./package.json').version;
    var target = constants.targetName;
    var appname = constants.appname;
    var slug = (appname + '-' + target).toLowerCase();
    var releaseName = target + '-v' + version;
    var srcmapPath = path.join(constants.exorcist.dest, releaseName + constants.exorcist.mapExtension);
    var normalizedURL = helper.resolveSentryNormalizedUrl(constants);
    var srcmapURL = normalizedURL + '/' + srcmapPath;
    var bundleName = constants.bundleName || 'bundle.js';
    var bundleDest = constants.dist.distFolder;
    bundleDest = helper.isMobile(constants) ? bundleDest + '/www' : bundleDest;
    var bundlePath = path.join(bundleDest, constants.script.dest, bundleName);
    var bundleURL = normalizedURL + '/' + releaseName + '/' + bundleName;

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

    exec(curlClear, {
        cwd: constants.cwd,
        maxBuffer: constants.maxBuffer
    }, function(err, stdout, stderr) {
        execHandler(err, stdout, stderr, 'clear release ' + chalk.yellow(releaseName), curlClear);
        exec(curlRelease, {
            cwd: constants.cwd,
            maxBuffer: constants.maxBuffer
        }, function(err, stdout, stderr) {
            execHandler(err, stdout, stderr, 'create release ' + chalk.yellow(releaseName), curlRelease);
            exec(curlSrcmap, {
                cwd: constants.cwd,
                maxBuffer: constants.maxBuffer
            }, function(err, stdout, stderr) {
                execHandler(err, stdout, stderr, 'upload sourcemap ' + chalk.green(srcmapPath) + ' for release ' + chalk.yellow(releaseName), curlSrcmap);
                exec(curlBundle, {
                    cwd: constants.cwd,
                    maxBuffer: constants.maxBuffer
                }, function(err, stdout, stderr) {
                    execHandler(err, stdout, stderr, 'upload bundle ' + chalk.green(bundlePath) + ' for release ' + chalk.yellow(releaseName), curlBundle);
                    done();
                });
            });
        });
    });
};

gulp.task('sentry:delete', 'Delete all error aggregates onn sentry', function(done) {
    var taskname = 'sentry:delete';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForMultipleTargets(taskname, {
            mode: 'prod'
        });
    } else {
        global.options.mode = 'prod';
    }
    var configOK = true;
    global.options.target = [].concat(global.options.target);
    global.options.target.forEach(function(target) {
        var targetObject = helper.targetToTemplateData(target, global.options.mode);
        var resolvedConstants = gmux.resolveConstants(constants, targetObject);
        configOK = configOK && checkSentryConfig(resolvedConstants);

    });
    if (!configOK) {
        return;
    }
    return gmux.createAndRunTasksSequential(gulp, taskSentryDeleteAllErrors, taskname, global.options.target, global.options.mode, constants, done);
});

gulp.task('sentry:upload', false, function(done) {
    var taskname = 'sentry:upload';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForMultipleTargets(taskname, {
            mode: 'prod'
        });
    } else {
        global.options.mode = 'prod';
    }
    var configOK = true;
    global.options.target = [].concat(global.options.target);
    global.options.target.forEach(function(target) {
        var targetObject = helper.targetToTemplateData(target, global.options.mode);
        var resolvedConstants = gmux.resolveConstants(constants, targetObject);
        configOK = configOK && checkSentryConfig(resolvedConstants);

    });
    if (!configOK) {
        return;
    }
    return gmux.createAndRunTasksSequential(gulp, taskSentry, taskname, global.options.target, global.options.mode, constants, done);
});

gulp.task('sentry', 'dist and upload bundles and sourcemaps to sentry.', function(done) {
    var runSeq = runSequence.use(gulp);
    var taskname = 'sentry';
    if (global.options === null) {
        global.options = gmux.targets.askForMultipleTargets(taskname, {
            mode: 'prod'
        });
    } else {
        global.options.mode = 'prod';
    }
    var configOK = true;
    global.options.target = [].concat(global.options.target);
    global.options.target.forEach(function(target) {
        var targetObject = helper.targetToTemplateData(target, global.options.mode);
        var resolvedConstants = gmux.resolveConstants(constants, targetObject);
        configOK = configOK && checkSentryConfig(resolvedConstants);

    });
    if (!configOK) {
        return;
    }
    runSeq('dist', 'sentry:upload', done);
});