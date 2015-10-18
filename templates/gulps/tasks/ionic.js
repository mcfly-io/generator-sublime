'use strict';

var gulp = require('gulp');
// var Q = require('q');
global.Promise = require('bluebird');
// var exec = require('child_process').exec;
var execAsync = Promise.promisify(require('child_process').exec);
var gmux = require('gulp-mux');
var runSequence = require('run-sequence');
var constants = require('../common/constants')();
var helper = require('../common/helper');
var gutil = require('gulp-util');
var promptAsync = Promise.promisify(require('inquirer').prompt);
var ionicLib = require('ionic-app-lib');
var path = require('path');
var mkdirp = require('mkdirp');

var ionicLogin = function(result) {
    if (result) {
        return ionicLib.login.resquestLogIn(result.email, result.password, true /* saveCookies */ );
    }
    return null;
};

var returnJarOrLogin = function(result) {
    if (result.jar) {
        return Promise.resolve(result.jar);
    }
    return promptAsync(result.questions)
        .then(function(answers) {
            // only resolving what we need
            return {
                email: answers.email || result.email,
                password: answers.password
            };
        })
        .then(ionicLogin);
};

gulp.task('ionic:ensurelogin', false, function() {
    return Promise.resolve()
        .then(ionicLib.login.retrieveLogin())
        .fail(function catchErrorAsNull() {
            return null;
        })
        .then(function returnJarWithQuestions(result) {
            return {
                jar: result,
                questions: [{
                    type: 'input',
                    message: 'Please enter your GitHub email',
                    name: 'email',
                    default: 'dev@yoobic.com',
                    validate: function(input) {
                        return /^[A-z0-9!#$%&'*+\/=?\^_{|}~\-]+(?:\.[A-z0-9!#$%&'*+\/=?\^_{|}~\-]+)*@(?:[A-z0-9](?:[A-z0-9\-]*[A-z0-9])?\.)+[A-z0-9](?:[A-z0-9\-]*[A-z0-9])?$/.test(input);
                    }
                }, {
                    type: 'password',
                    message: 'Please enter your GitHub password',
                    name: 'password',
                    validate: function(input) {
                        return input !== '';
                    }
                }]
            };
        })
        .then(returnJarOrLogin)
        .fail(function(err) {
            gutil.log(gutil.colors.red('Ionic Login failed! ') + 'Error message: ' + gutil.colors.yellow(err.message));
            return null;
        });
});

var taskIonicProject = function(constants) {
    if (!helper.isMobile(constants)) {
        return null;
    }

    var ionicProjectData = constants.ionic[constants.targetName];

    ionicLib.project.wrap(constants.dist.distFolder, ionicProjectData).save();

    return Promise.resolve(ionicLib.project.load(constants.dist.distFolder));
};

gulp.task('ionic:project', 'Create the project from the constants', ['ionic:ensurelogin'], function(done) {
    if (global.options) {
        if (!constants.ionic || !constants.ionic[global.options.target] || !constants.ionic[global.options.target].app_id || constants.ionic[global.options.target].app_id.length <= 0) {
            gutil.log(gutil.colors.yellow('The ionic.' + global.options.target + '.app_id is missing or empty in gulp_tasks/common/constants.js. This will upload a new app to apps.ionic.io. Please record the reported app_id as ionic.' + global.options.target + '.app_id in gulp_tasks/common/constants.js'));
        }
    }
    var taskname = 'ionic:project';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForMultipleTargets(taskname);
        // global.options = gmux.targets.askForSingleTarget(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskIonicProject, taskname, global.options.target, global.options.mode, constants, done);
});

var taskIonicPlatformCopy = function(constants) {
    if (!helper.isMobile(constants)) {
        return Promise.resolve(null);
    }

    var ionicPlatformSrc = constants.ionic.ionicPlatformBundleFiles.map(function (fileName) {
        return path.join('.',
            constants.ionic.ionicPlatformInstaller === 'npm' ? 'node_modules' : 'bower_components',
            constants.ionic.ionicPlatformModule,
            constants.ionic.ionicPlatformBundleSrc,
            fileName);
    });

    var ionicPlatformDest = path.join(constants.dist.distFolder, 'www', constants.ionic.ionicPlatformBundleDest);
    gutil.log('Copying ' + gutil.colors.cyan(ionicPlatformSrc) + ' to ' + gutil.colors.cyan(ionicPlatformDest));
    mkdirp(ionicPlatformDest);
    return gulp.src(ionicPlatformSrc).pipe(gulp.dest(ionicPlatformDest));
};

gulp.task('ionic:platformcopy', 'Upload the app to ionic.io platform', ['ionic:project'], function(done) {
    if (global.options) {
        if (!constants.ionic || !constants.ionic[global.options.target] || !constants.ionic[global.options.target].app_id || constants.ionic[global.options.target].app_id.length <= 0) {
            gutil.log(gutil.colors.yellow('The ionic.' + global.options.target + '.app_id is missing or empty in gulp_tasks/common/constants.js. This will upload a new app to apps.ionic.io. Please record the reported app_id as ionic.' + global.options.target + '.app_id in gulp_tasks/common/constants.js'));
        }
    }
    var taskname = 'ionic:platformcopy';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForMultipleTargets(taskname);
        // global.options = gmux.targets.askForSingleTarget(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskIonicPlatformCopy, taskname, global.options.target, global.options.mode, constants, done);
});

var taskIonicConfigBuild = function(constants) {
    if (!helper.isMobile(constants)) {
        return Promise.resolve(null);
    }
    gutil.log('Asking ionic to inject the config factory');

    return execAsync('ionic config set disable_modifications true', {
            cwd: constants.dist.distFolder
        })
        .then(helper.execHandlerAsync)
        .then(function() {
            return execAsync('ionic config build', {
                cwd: constants.dist.distFolder
            });
        })
        .then(helper.execHandlerAsync);
};

gulp.task('ionic:configbuild', 'Build the config info into the ionic platform library', ['ionic:platformcopy'], function(done) {
    if (global.options) {
        if (!constants.ionic || !constants.ionic[global.options.target] || !constants.ionic[global.options.target].app_id || constants.ionic[global.options.target].app_id.length <= 0) {
            gutil.log(gutil.colors.yellow('The ionic.' + global.options.target + '.app_id is missing or empty in gulp_tasks/common/constants.js. This will upload a new app to apps.ionic.io. Please record the reported app_id as ionic.' + global.options.target + '.app_id in gulp_tasks/common/constants.js'));
        }
    }
    var taskname = 'ionic:configbuild';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForMultipleTargets(taskname);
        // global.options = gmux.targets.askForSingleTarget(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskIonicConfigBuild, taskname, global.options.target, global.options.mode, constants, done);
});

var taskIonicUpload = function(constants) {
    if (!helper.isMobile(constants)) {
        return Promise.resolve(null);
    }
    var version = helper.readJsonFile('./package.json').version;

    var args = require('yargs').alias('n', 'note').alias('d', 'deploy').argv;
    var note = args.note || '';
    var deploy = args.deploy || '';
    gutil.log('Uploading to apps.ionic.io with the note: "' + gutil.colors.yellow('v' + version + ': ' + note) + '".');
    if (deploy) {
        gutil.log('Deploying to channel "' + gutil.colors.yellow(deploy) + '".');
    }
    if (constants.ionic[constants.targetName].app_id) {
        gutil.log('See this update at ' + gutil.colors.blue('https://apps.ionic.io/app/' + constants.ionic[constants.targetName].app_id + '/deploy') + '.');
    }
    var uploadCmd = 'ionic upload --note "v' + version + ': ' + note + '"';
    if (deploy) {
        uploadCmd = uploadCmd + '--deploy=' + deploy;
    }
    gutil.log(uploadCmd);

    return execAsync(uploadCmd, {
            cwd: constants.dist.distFolder
        })
        .then(helper.execHandlerAsync);
};

gulp.task('ionic:upload', 'Upload the app to ionic.io platform', ['ionic:configbuild'], function(done) {
    if (global.options) {
        if (!constants.ionic || !constants.ionic[global.options.target] || !constants.ionic[global.options.target].app_id || constants.ionic[global.options.target].app_id.length <= 0) {
            gutil.log(gutil.colors.yellow('The ionic.' + global.options.target + '.app_id is missing or empty in gulp_tasks/common/constants.js. This will upload a new app to apps.ionic.io. Please record the reported app_id as ionic.' + global.options.target + '.app_id in gulp_tasks/common/constants.js'));
        }
    }
    var taskname = 'ionic:upload';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForMultipleTargets(taskname);
        // global.options = gmux.targets.askForSingleTarget(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskIonicUpload, taskname, global.options.target, global.options.mode, constants, done);
});

gulp.task('ionic:deploy', null, function(done) {
    runSequence('dist', 'ionic:upload');
});
