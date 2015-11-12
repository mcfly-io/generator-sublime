/*eslint handle-callback-err:0,consistent-return:0, new-cap:0*/
'use strict';
global.Promise = require('bluebird');
var gulp = require('gulp');
var rename = require('gulp-rename');
var tap = require('gulp-tap');
var imagemin = require('gulp-imagemin');
var del = require('del');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var gmux = require('gulp-mux');
var runSequence = require('run-sequence');
var constants = require('../common/constants')();
var helper = require('../common/helper');
var fs = require('fs');
var XML = require('node-jsxml').XML;
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var inquirer = require('inquirer');

var taskClean = function(constants) {
    del([constants.dist.distFolder]);
};

gulp.task('clean', 'Clean distribution folder.', function(done) {
    var taskname = 'clean';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForMultipleTargets(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskClean, taskname, global.options.target, global.options.mode, constants, done);
});

var taskHtml = function(constants) {

    var dest = constants.dist.distFolder;
    dest = helper.isMobile(constants) ? dest + '/www' : dest;

    gulp.src(constants.html.src)
        .pipe(rename('index.html'))
        .pipe(gulp.dest(dest));

    gulp.src('./' + constants.clientFolder + '/*' + constants.targetSuffix + '.html')
        .pipe(rename(function(path) {
            path.basename = path.basename.replace(constants.targetSuffix, '');
        }))
        .pipe(gulp.dest(dest));

    gulp.src('./' + constants.clientFolder + '/404' + constants.targetSuffix + '.html')
        .pipe(rename('404.html'))
        .pipe(gulp.dest(dest));

    gulp.src('./' + constants.clientFolder + '/favicon' + constants.targetSuffix + '.ico')
        .pipe(rename('favicon.ico'))
        .pipe(gulp.dest(dest));

    gulp.src('./' + constants.clientFolder + '/robots' + constants.targetSuffix + '.txt')
        .pipe(rename('robots.txt'))
        .pipe(gulp.dest(dest));

    gulp.src('./' + constants.clientFolder + '/apple-touch-icon' + constants.targetSuffix + '.png')
        .pipe(rename('apple-touch-icon.png'))
        .pipe(gulp.dest(dest));

    gulp.src('./' + constants.clientFolder + '/config' + constants.targetSuffix + '.xml')
        .pipe(rename('config.xml'))
        .pipe(gulp.dest(constants.dist.distFolder));

    gulp.src(constants.cordova.src + '/hooks/**/*.*')
        .pipe(gulp.dest(constants.dist.distFolder + '/hooks'));
};

var taskImage = function(constants) {
    var dest = constants.dist.distFolder;
    dest = helper.isMobile(constants) ? dest + '/www' : dest;

    gulp.src(constants.images.src, {
            base: constants.clientFolder
        })
        .pipe(gulpif(constants.mode === 'prod' && constants.images.minify === true, imagemin()))
        .pipe(gulp.dest(dest));

};

var taskImageCordova = function(constants) {
    if (helper.isMobile(constants)) {
        if (fs.existsSync(constants.dist.distFolder + '/platforms/ios')) {

            var srcxml = './' + constants.clientFolder + '/config' + constants.targetSuffix + '.xml';

            var configFileContent = helper.readTextFile(srcxml);
            var xml = new XML(configFileContent);
            var appname = xml.child('name').getValue();

            gulp.src(constants.cordova.src + '/resources/ios/icons/**/*')
                .pipe(gulp.dest(constants.dist.distFolder + '/platforms/ios/' + appname + '/Resources/icons'));

            gulp.src(constants.cordova.src + '/resources/ios/splash/**/*')
                .pipe(gulp.dest(constants.dist.distFolder + '/platforms/ios/' + appname + '/Resources/splash'));
        }
        if (fs.existsSync(constants.dist.distFolder + '/platforms/android')) {
            gulp.src(constants.cordova.src + '/resources/android/**/*')
                .pipe(gulp.dest(constants.dist.distFolder + '/platforms/android/res'));
        }
        if (fs.existsSync(constants.dist.distFolder + '/platforms/blackberry10')) {
            gulp.src(constants.cordova.src + '/resources/blackberry10/**/*')
                .pipe(gulp.dest(constants.dist.distFolder + '/platforms/blackberry10/platform_www'));
        }
    }
};

gulp.task('html', false, function() {
    var taskname = 'html';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForMultipleTargets(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskHtml, taskname, global.options.target, global.options.mode, constants);
});

var taskAngulari18n = function(constants) {
    var dest = constants.dist.distFolder;
    dest = helper.isMobile(constants) ? dest + '/www' : dest;

    gulp.src('./bower_components/angular-i18n/*.js')
        .pipe(gulp.dest(dest + '/angular/i18n'));
};

gulp.task('angular:i18n', false, function() {
    var taskname = 'angular:i18n';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    gmux.createAndRunTasks(gulp, taskAngulari18n, taskname, global.options.target, global.options.mode, constants);
});

gulp.task('image', false, ['image:cordova'], function() {
    var taskname = 'image';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForMultipleTargets(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskImage, taskname, global.options.target, global.options.mode, constants);
});

gulp.task('image:cordova', false, function() {
    // this task copy the cordova icons and splashes to dist, but only if the platforms exist
    var taskname = 'image:cordova';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForMultipleTargets(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskImageCordova, taskname, global.options.target, global.options.mode, constants);
});

var taskCordovaIcon = function(constants) {
    if (!helper.isMobile(constants)) {
        return;
    }
    exec('./bin/cordova-generate-icons ' + constants.cordova.icon + ' ' + constants.cordova.src, {
        maxBuffer: constants.maxBuffer
    }, helper.execHandler);
    exec('./bin/cordova-generate-splashes ' + constants.cordova.splash + ' "' + constants.cordova.iconBackground + '" ' + constants.cordova.src, {
        maxBuffer: constants.maxBuffer
    }, helper.execHandler);
};

gulp.task('cordova:icon', 'Generate the cordova icons and splashes.', function() {
    var taskname = 'cordova:icon';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForMultipleTargets(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskCordovaIcon, taskname, global.options.target, global.options.mode, constants);
});

gulp.task('dist', 'Distribute the application.', function(done) {
    return runSequence('html', 'image', 'angular:i18n', constants.moduleManager === 'webpack' ? 'webpack:run' : 'browserify', 'style', 'font', done);
});

gulp.task('clean:all', 'Clean distribution folder for all targets and modes.', function() {
    var taskname = 'clean:all';
    gmux.targets.setClientFolder(constants.clientFolder);
    var targets = gmux.targets.getAllTargets();
    gmux.createAndRunTasks(gulp, taskClean, taskname, targets, 'dev', constants);
    gmux.createAndRunTasks(gulp, taskClean, taskname, targets, 'prod', constants);
});

var taskCordovaTestFairyPlatform = function(constants) {
    var appname = null;
    if (!helper.isMobile(constants)) {
        return;
    }
    var srcxml = './' + constants.clientFolder + '/config' + constants.targetSuffix + '.xml';

    var testfairyUpload = function testfairyUpload(file, platform) {
        var metrics = '\'' + constants.testfairy.metrics + '\'';
        var testersGroups = '\'' + constants.testfairy.testersGroups + '\'';
        var maxDuration = '\'' + constants.testfairy.maxDuration + '\'';
        var autoUpdate = '\'' + constants.testfairy.autoUpdate + '\'';
        var iconWatermark = '\'' + constants.testfairy.iconWatermark + '\'';

        return new Promise(function(resolve, reject) {
            if (!(file && file.path)) {
                gutil.log(gutil.colors.red('Error: Binary for ') + gutil.colors.yellow(platform) + gutil.colors.red(' was not created.'));
                reject(new Error('No binary'));
            }
            helper
                .checkFileAge(file)
                .then(function() {
                    exec('curl https://app.testfairy.com/api/upload -F api_key=\'' + constants.testfairy.api_key + '\' -F file=@\'' + file.path + '\' -F metrics=' + metrics + '  -F testers_groups=' + testersGroups + ' -F max-duration=' + maxDuration + ' -F auto-update=' + autoUpdate + ' -F icon-watermark=' + iconWatermark + ' ', {
                        cwd: constants.dist.distFolder,
                        maxBuffer: constants.maxBuffer
                    }, function(err, stdout, stderr) {
                        if (!err) {
                            gutil.log(gutil.colors.green('Sucessfully uploaded ') + gutil.colors.cyan(file.path) + gutil.colors.green(' to testfairy.'));
                        }
                        helper.execHandler(err, stdout);
                        resolve();
                    });
                })
                .catch(function(err) {
                    gutil.log(gutil.colors.yellow('Warning: ') + 'file ' + file.path + ' will not be deployed.');
                    reject(new Error(file.path + 'will not be deployed :' + err));
                });
        });

    };

    gulp.src(srcxml)
        .pipe(tap(function(file) {
            var xml = new XML(String(file.contents));
            appname = xml.child('name').getValue();
        }))
        .on('end', function() {
            exec('cordova platform add ios && cordova platform add android', {
                cwd: constants.dist.distFolder,
                maxBuffer: constants.maxBuffer
            }, function(err, stdout, stderr) {
                helper.execHandler(err, stdout, stderr, {
                    stderrIsNotError: true
                });
                gutil.log(stdout);
                exec('cordova build ios --device && cordova build android --device', {
                    cwd: constants.dist.distFolder,
                    maxBuffer: constants.maxBuffer
                }, function(err, stdout, stderr) {
                    helper.execHandler(err, stdout, stderr, {
                        stderrIsNotError: true
                    });

                    var androidFile = helper.findAndroidFile(constants.dist.distFolder);
                    var iosFile = helper.findIOSFile(constants.dist.distFolder, appname);

                    exec('/usr/bin/xcrun -sdk iphoneos PackageApplication "$(pwd)/' + appname + '.app" -o "$(pwd)/' + appname + '.ipa"', {
                        cwd: constants.dist.distFolder + '/platforms/ios/build/device',
                        maxBuffer: constants.maxBuffer
                    }, function(err, stdout, stderr) {
                        helper.execHandler(err, stdout, stderr);

                        // upload to testfairy the ios ipa, then the android apk
                        testfairyUpload(iosFile, 'ios')
                            .catch(function() {})
                            .then(function() {
                                testfairyUpload(androidFile, 'android');
                            });
                    });

                });
            });
        });
};

var taskCordovaAllPlatform = function(constants) {
    var appname = null;
    if (!helper.isMobile(constants)) {
        return;
    }
    var srcxml = './' + constants.clientFolder + '/config' + constants.targetSuffix + '.xml';
    gulp.src(srcxml)
        .pipe(tap(function(file) {
            var xml = new XML(String(file.contents));
            appname = xml.child('name').getValue();
        }))
        .on('end', function() {
            exec('cordova platform add ios && cordova platform add android', {
                cwd: constants.dist.distFolder,
                maxBuffer: constants.maxBuffer
            }, function(err, stdout, stderr) {
                if (err) {
                    gutil.log(gutil.colors.red(err.message));
                }
                gutil.log(stdout);
                exec('cordova build ios --device && cordova build android --device', {
                    cwd: constants.dist.distFolder,
                    maxBuffer: constants.maxBuffer
                }, function(err, stdout, stderr) {
                    helper.execHandler(err, stdout, stderr);
                    exec('/usr/bin/xcrun -sdk iphoneos PackageApplication "$(pwd)/' + appname + '.app" -o "$(pwd)/' + appname + '.ipa"', {
                        cwd: constants.dist.distFolder + '/platforms/ios/build/device',
                        maxBuffer: constants.maxBuffer
                    }, function(err, stdout, stderr) {
                        helper.execHandler(err, stdout, stderr);
                    });
                });
            });

        });
};

gulp.task('cordova:testfairy:platform', false, function() {
    var taskname = 'cordova:testfairy:platform';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    if (!constants.testfairy.api_key || constants.testfairy.api_key.length <= 0) {
        gutil.log(gutil.colors.red('The testfairy.api_key is missing or empty in gulp_tasks/common/constants.js'));
        return;
    }
    return gmux.createAndRunTasks(gulp, taskCordovaTestFairyPlatform, taskname, global.options.target, global.options.mode, constants);
});

gulp.task('cordova:testfairy', 'Bump version and Build a testfairy binary.', function(done) {
    if (!constants.testfairy.api_key || constants.testfairy.api_key.length <= 0) {
        gutil.log(gutil.colors.red('The testfairy.api_key is missing or empty in gulp_tasks/common/constants.js'));
        return;
    }
    var questions = [{
        type: 'confirm',
        message: 'Do you want to bump the version',
        name: 'bump',
        default: true
    }];
    inquirer.prompt(questions, function(answers) {
        if (answers.bump === true) {
            return runSequence('bump', 'wait', 'dist', 'wait', 'cordova:testfairy:platform', done);
        } else {
            return runSequence('dist', 'wait', 'cordova:testfairy:platform', done);
        }
    });
});

gulp.task('cordova:all', 'Build a binary for android (.pka) and ios (.ipa)', function(done) {
    return runSequence('dist', 'wait', 'cordova:all:platform', done);
});

gulp.task('cordova:all:platform', false, function() {
    var taskname = 'cordova:all:platform';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskCordovaAllPlatform, taskname, global.options.target, global.options.mode, constants);
});

var taskCordovaInstallIOS = function(constants, done) {
    if (!helper.isMobile(constants)) {
        return;
    }
    var task = spawn('cordova', ['run', 'ios', '--device'], {
        cwd: constants.dist.distFolder
    });
    task.stdout.on('data', function(data) {
        gutil.log(' ' + data);
    });
    task.stderr.on('data', function(data) {
        gutil.log(gutil.colors.red(data));
    });
    task.on('exit', function() {
        done();
    });

};

gulp.task('cordova:install:ios', false, function(done) {
    var taskname = 'cordova:install';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        //global.options = gmux.targets.askForMultipleTargets(taskname);
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskCordovaInstallIOS, taskname, global.options.target, global.options.mode, constants);

});

gulp.task('cordova:install', 'Install the app on ios', function(done) {
    return runSequence('dist', 'wait', 'cordova:install:ios', done);
});

var taskIonicUpload = function(constants, done) {
    if (!helper.isMobile(constants)) {
        return;
    }
    var note = require('yargs').alias('n', 'note').argv.note || '';

    var version = helper.readJsonFile('./package.json').version;
    var ionicProjectJson = {};
    try {
        ionicProjectJson = helper.readJsonFile(constants.dist.distFolder + '/ionic.project');
    } catch (e) {
        gutil.log(gutil.colors.yellow('dist/' + constants.targetName + '/' + constants.mode + '/ionic.project does not exist. It will be created.'));
    }

    constants.ionic = constants.ionic || {};
    constants.ionic[constants.targetName] = constants.ionic[constants.targetName] || {};

    gutil.log('Uploading to apps.ionic.io with the note: "' + gutil.colors.yellow('v' + version + ': ' + note) + '".');
    if (constants.ionic[constants.targetName].app_id) {
        gutil.log('See this update at ' + gutil.colors.blue('https://apps.ionic.io/app/' + constants.ionic[constants.targetName].app_id + '/deploy') + '.');
    }

    ionicProjectJson.name = ionicProjectJson.name || constants.targetName;
    if (!ionicProjectJson.app_id || !constants.ionic[constants.targetName].app_id || ionicProjectJson.app_id !== constants.ionic[constants.targetName].app_id) {
        gutil.log(gutil.colors.yellow('The ionic.' + global.options.target + '.app_id in gulp_tasks/common/constants.js does not match the app_id in dist/' + constants.targetName + '/' + constants.mode + '/ionic.project.'));
    }

    ionicProjectJson.app_id = constants.ionic[constants.targetName].app_id || ionicProjectJson.app_id || '';
    helper.writeJsonFile(constants.dist.distFolder + '/ionic.project', ionicProjectJson);

    var task = spawn('ionic', ['upload', '--note', '"v' + version + ': ' + note + '"'], {
        cwd: constants.dist.distFolder
    });
    task.stdout.on('data', function(data) {
        gutil.log(' ' + data);
    });
    task.stderr.on('data', function(data) {
        gutil.log(gutil.colors.red(data));
    });
    task.on('exit', function() {
        done();
    });

};

gulp.task('ionic:upload', 'Upload the app to ionic.io platform', function(done) {
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
    return gmux.createAndRunTasks(gulp, taskIonicUpload, taskname, global.options.target, global.options.mode, constants);
});

gulp.task('deploy:all', 'Global task for deploying the application', function(done) {
    var taskname = 'deploy:all';
    var questions = [{
        type: 'confirm',
        message: 'Do you want to bump the version',
        name: 'bump',
        default: true
    }, {
        type: 'confirm',
        message: 'Do you want to upload the binaries to testfairy',
        name: 'testfairy',
        default: true
    }, {
        type: 'confirm',
        message: 'Do you want to clear the Sentry history',
        name: 'sentryDelete',
        default: true
    }, {
        type: 'confirm',
        message: 'Do you want to upload the source map & bundle to Sentry',
        name: 'sentryUpload',
        default: true
    }, {
        type: 'confirm',
        message: 'Do you want to upload the ionic project to apps.ionic.io',
        name: 'ionicUpload',
        default: true
    }];
    inquirer.prompt(questions, function(answers) {
        var runSeq = [];
        if (answers.bump === true) {
            runSeq = runSeq.concat(['bump', 'wait']);
        }
        runSeq = runSeq.concat(['dist', 'wait']);
        if (answers.testfairy === true) {
            runSeq = runSeq.concat(['cordova:testfairy:platform', 'wait']);
        } else {
            runSeq = runSeq.concat(['cordova:all:platform', 'wait']);
        }
        if (answers.sentryDelete === true) {
            runSeq = runSeq.concat(['sentry:delete', 'wait']);
        }
        if (answers.sentryUpload === true) {
            runSeq = runSeq.concat(['sentry:upload', 'wait']);
        }
        if (answers.ionicUpload === true) {
            runSeq = runSeq.concat(['ionic:upload', 'wait']);
        }
        runSeq = runSeq.concat([done]);
        if (global.options === null) {
            global.options = gmux.targets.askForSingleTarget(taskname, {
                mode: 'prod'
            });
        } else {
            global.options.mode = 'prod';
        }
        return runSequence.apply(gulp, runSeq);
    });
});

gulp.task('wait', false, function(done) {
    setTimeout(function() {
        done();
    }, 3000);
});
