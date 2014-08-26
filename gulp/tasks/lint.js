var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var map = require('map-stream');
var combine = require('stream-combiner');
var chalk = require('jshint-stylish/node_modules/chalk');
var growly = require('growly');
var jshint = $.jshint;
var jscs = $.jscs;
var constants = require('../common/constants')();

gulp.task('jshint', function() {
    var hasError = false;
    var hasShown = false;
    var successReporter = map(function(file, cb) {
        if(!file.jshint.success) {
            hasError = true;
        }
        cb(null, file);
    });

    gulp.src(constants.lint)
        .pipe(jshint({
            lookup: true
        }))
        .pipe(successReporter)
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(jshint.reporter('fail'))
        .on('error', function() {
            console.log(chalk.red('Jshint failed'));
            growly.notify('One or more jshint error', {
                title: 'FAILED - JsHint',
                icon: constants.growly.failedIcon
            });
            throw new Error('jshint failed');
        })
        .pipe(map(function() {
            if(!hasError && !hasShown) {
                hasShown = true;
                console.log(chalk.green('All Jshint files passed'));
                growly.notify('All files passed', {
                    title: 'PASSED - JsHint',
                    icon: constants.growly.successIcon
                });

            }

        }));
});

gulp.task('jscs', function() {
    var hasError = false;
    var combined = combine(
        gulp.src(constants.lint),
        jscs());

    combined.on('error', function(err) {
        hasError = true;

        console.log(err.toString());
        console.log(chalk.red('Jscs failed'));
        growly.notify('One or more jscs error', {
            title: 'FAILED - Jscs',
            icon: constants.growly.failedIcon
        });
        throw new Error('jscs failed');
    });

    combined.on('end', function() {
        if(!hasError) {
            console.log(chalk.green('All Jscs files passed'));
            growly.notify('All files passed', {
                title: 'PASSED - Jscs',
                icon: constants.growly.successIcon
            });

        }
    });

});

gulp.task('lint', ['jshint', 'jscs']);
