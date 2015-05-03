'use strict';
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var rename = $.rename;
var imagemin = $.imagemin;
var del = require('del');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var gmux = require('gulp-mux');
var runSequence = require('run-sequence');
var constants = require('../common/constants')();
var helper = require('../common/helper');
var fs = require('fs');
var XML = require('node-jsxml').XML;
var tap = $.tap;
var gutil = require('gulp-util');

var taskClean = function(constants) {
    del([constants.dist.distFolder]);
};

gulp.task('clean', 'Clean distribution folder.', function(done) {
    var taskname = 'clean';
    gmux.targets.setClientFolder(constants.clientFolder);
    if(global.options === null) {
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
        .pipe(imagemin())
        .pipe(gulp.dest(dest));

};

var taskImageCordova = function(constants) {
    if(helper.isMobile(constants)) {
        if(fs.existsSync(constants.dist.distFolder + '/platforms/ios')) {
            gulp.src(constants.cordova.src + '/resources/ios/icons/**/*')
                .pipe(imagemin())
                .pipe(gulp.dest(constants.dist.distFolder + '/platforms/ios/' + constants.appname + '/Resources/icons'));

            gulp.src(constants.cordova.src + '/resources/ios/splash/**/*')
                .pipe(imagemin())
                .pipe(gulp.dest(constants.dist.distFolder + '/platforms/ios/' + constants.appname + '/Resources/splash'));
        }
        if(fs.existsSync(constants.dist.distFolder + '/platforms/android')) {
            gulp.src(constants.cordova.src + '/resources/android/**/*')
                .pipe(imagemin())
                .pipe(gulp.dest(constants.dist.distFolder + '/platforms/android/res'));
        }
    }
};

gulp.task('html', false, function() {
    var taskname = 'html';
    gmux.targets.setClientFolder(constants.clientFolder);
    if(global.options === null) {
        global.options = gmux.targets.askForMultipleTargets(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskHtml, taskname, global.options.target, global.options.mode, constants);
});

var taskHtmlWatch = function(constants) {
    gulp.watch(constants.html.src, ['html']);
};

gulp.task('html:watch', false, function() {

    var taskname = 'html:watch';
    gmux.targets.setClientFolder(constants.clientFolder);
    if(global.options === null) {
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    gmux.createAndRunTasks(gulp, taskHtmlWatch, taskname, global.options.target, global.options.mode, constants);
});

var taskAngulari18n = function(constants) {
    gulp.src('./bower_components/angular-i18n/*.js')
        .pipe(gulp.dest(constants.dist.distFolder + '/angular/i18n'));
};

gulp.task('angular:i18n', false, function() {
    var taskname = 'angular:i18n';
    gmux.targets.setClientFolder(constants.clientFolder);
    if(global.options === null) {
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    gmux.createAndRunTasks(gulp, taskAngulari18n, taskname, global.options.target, global.options.mode, constants);
});

var taskImageWatch = function(constants) {
    gulp.watch(gmux.sanitizeWatchFolders(constants.images.src), ['image']);
};

gulp.task('image:watch', false, function() {

    var taskname = 'image:watch';
    gmux.targets.setClientFolder(constants.clientFolder);
    if(global.options === null) {
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    gmux.createAndRunTasks(gulp, taskImageWatch, taskname, global.options.target, global.options.mode, constants);
});

gulp.task('image', false, ['image:cordova'], function() {
    var taskname = 'image';
    gmux.targets.setClientFolder(constants.clientFolder);
    if(global.options === null) {
        global.options = gmux.targets.askForMultipleTargets(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskImage, taskname, global.options.target, global.options.mode, constants);
});

gulp.task('image:cordova', false, function() {
    // this task copy the cordova icons and splashes to dist, but only if the platforms exist
    var taskname = 'image:cordova';
    gmux.targets.setClientFolder(constants.clientFolder);
    if(global.options === null) {
        global.options = gmux.targets.askForMultipleTargets(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskImageCordova, taskname, global.options.target, global.options.mode, constants);
});

var taskCordovaIcon = function(constants) {
    if(!helper.isMobile(constants)) {
        return;
    }
    exec('./bin/cordova-generate-icons ' + constants.cordova.icon + ' ' + constants.cordova.src, helper.execHandler);
    exec('./bin/cordova-generate-splashes ' + constants.cordova.icon + ' "' + constants.cordova.iconBackground + '" ' + constants.cordova.src, helper.execHandler);
};

gulp.task('cordova:icon', 'Generate the cordova icons and splashes.', function() {
    var taskname = 'cordova:icon';
    gmux.targets.setClientFolder(constants.clientFolder);
    if(global.options === null) {
        global.options = gmux.targets.askForMultipleTargets(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskCordovaIcon, taskname, global.options.target, global.options.mode, constants);
});

gulp.task('dist', 'Distribute the application.', function(done) {
    return runSequence('html', 'image', 'angular:i18n', 'browserify', 'style', done);
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
    if(!helper.isMobile(constants)) {
        return;
    }
    var srcxml = './' + constants.clientFolder + '/config' + constants.targetSuffix + '.xml';
    gulp.src(srcxml)
        .pipe(tap(function(file) {
            var xml = new XML(String(file.contents));
            appname = xml.child('name').getValue();
        }))
        .on('end', function() {
            exec('ionic platform add ios && ionic platform add android', {
                cwd: constants.dist.distFolder
            }, function(err, stdout, stderr) {
                gutil.log(stdout);
                exec('cordova build ios --device && cordova build android --device', {
                    cwd: constants.dist.distFolder
                }, function(err, stdout, stderr) {
                    helper.execHandler(err, stdout, stderr);
                    exec('/usr/bin/xcrun -sdk iphoneos PackageApplication "$(pwd)/' + appname + '.app" -o "$(pwd)/' + appname + '.ipa"', {
                        cwd: constants.dist.distFolder + '/platforms/ios/build/device'
                    }, function(err, stdout, stderr) {
                        helper.execHandler(err, stdout, stderr);
                        exec('curl https://app.testfairy.com/api/upload -F api_key=\'' + constants.testfairy.api_key + '\' -F file=@platforms/android/ant-build/MainActivity-debug.apk -F metrics=\'cpu,network,logcat\'  -F testers_groups=\'all\' -F max-duration=\'15m\' -F auto-update=\'on\' ', {
                            cwd: constants.dist.distFolder
                        }, function(err, stdout, stderr) {
                            gutil.log(stdout);
                        });

                        exec('curl https://app.testfairy.com/api/upload -F api_key=\'' + constants.testfairy.api_key + '\' -F file=@platforms/ios/build/device/' + appname + '.ipa -F metrics=\'cpu,network,logcat\' -F testers_groups=\'all\' -F max-duration=\'15m\'  -F auto-update=\'on\' ', {
                            cwd: constants.dist.distFolder
                        }, function(err, stdout, stderr) {
                            gutil.log(stdout);
                        });

                    });
                });
            });

        });
};

gulp.task('cordova:testfairy:platform', 'Build a testfairy binary for android (.pka) and ios (.ipa)', function() {
    var taskname = 'cordova:testfairy:platform';
    gmux.targets.setClientFolder(constants.clientFolder);
    if(global.options === null) {
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    if(!constants.testfairy.api_key || constants.testfairy.api_key.length <= 0) {
        gutil.log(gutil.colors.red('The testfairy.api_key is missing or empty in gulp_tasks/common/constants.js'));
        return;
    }
    return gmux.createAndRunTasks(gulp, taskCordovaTestFairyPlatform, taskname, global.options.target, global.options.mode, constants);
});

gulp.task('cordova:testfairy', 'Bump version and Build a testfairy binary.', function(done) {
    if(!constants.testfairy.api_key || constants.testfairy.api_key.length <= 0) {
        gutil.log(gutil.colors.red('The testfairy.api_key is missing or empty in gulp_tasks/common/constants.js'));
        return;
    }
    return runSequence('bump', 'wait', 'dist', 'wait', 'cordova:testfairy:platform', done);
});

var taskCordovaInstallIOS = function(constants, done) {
    if(!helper.isMobile(constants)) {
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

gulp.task('cordova:install:ios', 'Install the app on ios', function(done) {
    var taskname = 'cordova:install';
    gmux.targets.setClientFolder(constants.clientFolder);
    if(global.options === null) {
        //global.options = gmux.targets.askForMultipleTargets(taskname);
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskCordovaInstallIOS, taskname, global.options.target, global.options.mode, constants);

});

gulp.task('cordova:install', function(done) {
    return runSequence('dist', 'wait', 'cordova:install:ios', done);
});

gulp.task('wait', function(done) {
    setTimeout(function() {
        done();
    }, 3000);
});