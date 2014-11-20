'use strict';
var gulp = require('gulp');
var path = require('path');
var args = require('yargs').argv;
var _ = require('lodash');
var globToRegexp = require('glob-to-regexp');
var $ = require('gulp-load-plugins')();
var fs = require('fs');
var del = require('del');
var exec = require('child_process').exec;
var constants = require('../common/constants')();

function getIndexFiles() {
    var re = globToRegexp('{index-*.html,index.html}', {
        extended: true
    });

    return _.chain(fs.readdirSync('client'))
        .filter(function(name) {
            return re.test(name);
        })
        .map(function(name) {
            var appname = path.basename(name, '.html');
            appname = appname === 'index' ? 'app' : _.chain(appname.split('-')).last().value();
            return appname;
        })
        .value();
}

gulp.task('clean', 'Clean distribution folder.', function(done) {
    del([constants.dist.distFolder], done);
});

gulp.task('dist', 'Distribute the application.', ['clean', 'browserify', 'style'], function(done) {
    getIndexFiles().forEach(function(name) {

        gulp.src('./client/scripts/bundle.js')
            .pipe(gulp.dest(path.join(constants.dist.distFolder, name)));
    });
});