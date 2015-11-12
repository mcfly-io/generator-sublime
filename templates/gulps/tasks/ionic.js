'use strict';

var gulp = require('gulp');
global.Promise = require('bluebird');
var gmux = require('gulp-mux');
var runSequence = require('run-sequence');
var constants = require('../common/constants')();
var helper = require('../common/helper');
var gutil = require('gulp-util');
var replace = require('gulp-replace');
var rename = require('gulp-rename');
var ionicLib = require('ionic-app-lib');
var path = require('path');

var ensureLogin = function() {
    return Promise.resolve()
        .then(ionicLib.login.retrieveLogin)
        .then(function(jar) {
            if (!jar) {
                throw new Error(gutil.colors.red('Not login found, please run \`ionic login\` to continue.'));
            }
            return jar;
        });
};

gulp.task('ionic:ensurelogin', false, function() {
    return ensureLogin();
});

/*
 * Create an ionic.project config from the constants
 */

var taskIonicProject = function(constants) {
    if (!helper.isMobile(constants)) {
        return null;
    }

    var ionicProjectData = constants.ionic[constants.targetName];

    ionicLib.project.wrap(constants.dist.distFolder, ionicProjectData).save();

    return Promise.resolve(ionicProjectData);
};

gulp.task('ionic:project', false, ['ionic:ensurelogin'], function(done) {
    if (global.options) {
        if (!constants.ionic || !constants.ionic[global.options.target] || !constants.ionic[global.options.target].app_id || constants.ionic[global.options.target].app_id.length <= 0) {
            gutil.log(gutil.colors.yellow('The ionic.' + global.options.target + '.app_id is missing or empty in gulp_tasks/common/constants.js. This will upload a new app to apps.ionic.io. Please record the reported app_id as ionic.' + global.options.target + '.app_id in gulp_tasks/common/constants.js'));
        }
    }
    var taskname = 'ionic:project';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        // global.options = gmux.targets.askForMultipleTargets(taskname);
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskIonicProject, taskname, global.options.target, global.options.mode, constants, done);
});

var taskIonicPlatformCopy = function(constants) {
    if (!helper.isMobile(constants)) {
        return Promise.resolve(null);
    }

    var ionicPlatform = constants.ionic.ionicPlatform;

    var ionicPlatformSrc = ionicPlatform.bundleFiles.map(function(fileName) {
        return path.join('.',
            ionicPlatform.installer,
            ionicPlatform.moduleName,
            ionicPlatform.bundleSrc,
            fileName);
    });

    var ionicPlatformDest = path.join(ionicPlatform.bundleDest);

    gutil.log('Copying ' + gutil.colors.cyan(ionicPlatformSrc) + ' to ' + gutil.colors.cyan(ionicPlatformDest));

    // The following is based on http://blog.samuelbrown.io/2015/10/08/upgrading-ionic-io-services-tips-and-tricks/
    return taskIonicProject(constants)
        .then(function(configData) {
            var replacementString = 'var settings = ' + JSON.stringify(configData) + '; ' + ionicPlatform.settingsReplaceString;
            return gulp.src(ionicPlatformSrc)
                .pipe(replace(new RegExp('(' + ionicPlatform.settingsReplaceStart + ')(.*?)(' + ionicPlatform.settingsReplaceEnd + ')', 'g'), '$1' + replacementString + '$3'))
                .pipe(rename(function(path){
                    path.basename += constants.targetSuffix;
                }))
                .pipe(gulp.dest(ionicPlatformDest));
        });
};

/*
 * Copy the platform bundle over from npm to the ionic project and insert the correct app_id and api_key config information.
 */

gulp.task('ionic:platformcopy', false, ['ionic:ensurelogin'], function(done) {
    if (global.options) {
        if (!constants.ionic || !constants.ionic[global.options.target] || !constants.ionic[global.options.target].app_id || constants.ionic[global.options.target].app_id.length <= 0) {
            gutil.log(gutil.colors.yellow('The ionic.' + global.options.target + '.app_id is missing or empty in gulp_tasks/common/constants.js. This will upload a new app to apps.ionic.io. Please record the reported app_id as ionic.' + global.options.target + '.app_id in gulp_tasks/common/constants.js'));
        }
    }
    var taskname = 'ionic:platformcopy';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        // global.options = gmux.targets.askForMultipleTargets(taskname);
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskIonicPlatformCopy, taskname, global.options.target, global.options.mode, constants, done);
});

var taskIonicUpload = function(constants) {
    if (!helper.isMobile(constants)) {
        return Promise.resolve(null);
    }
    var version = helper.readJsonFile('./package.json').version;

    var args = require('yargs').alias('n', 'note').alias('d', 'deploy').argv;
    var note = args.note ? 'v' + version + ': ' + args.note : 'v' + version;
    var deploy = args.deploy || '';
    gutil.log('Uploading to apps.ionic.io with the note: "' + gutil.colors.yellow(note) + '".');
    if (deploy) {
        gutil.log('Deploying to channel "' + gutil.colors.yellow(deploy) + '".');
    }
    if (constants.ionic[constants.targetName].app_id) {
        gutil.log('See this update at ' + gutil.colors.blue('https://apps.ionic.io/app/' + constants.ionic[constants.targetName].app_id + '/deploy') + '.');
    }

    var doUpload = function(jar) {
        return ionicLib.upload.doUpload(constants.dist.distFolder, jar, note, deploy);
    };

    return ensureLogin()
        .then(doUpload);
};

/*
 * Upload the app to ionic.io platform
 */

gulp.task('ionic:upload', false, ['ionic:project'], function(done) {
    if (global.options) {
        if (!constants.ionic || !constants.ionic[global.options.target] || !constants.ionic[global.options.target].app_id || constants.ionic[global.options.target].app_id.length <= 0) {
            gutil.log(gutil.colors.yellow('The ionic.' + global.options.target + '.app_id is missing or empty in gulp_tasks/common/constants.js. This will upload a new app to apps.ionic.io. Please record the reported app_id as ionic.' + global.options.target + '.app_id in gulp_tasks/common/constants.js'));
        }
    }
    var taskname = 'ionic:upload';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        // global.options = gmux.targets.askForMultipleTargets(taskname);
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskIonicUpload, taskname, global.options.target, global.options.mode, constants, done);
});

gulp.task('ionic:deploy', false, function() {
    runSequence('dist', 'ionic:upload');
});
