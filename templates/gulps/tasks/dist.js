'use strict';
var gulp = require('gulp');
var path = require('path');
var args = require('yargs').argv;
var _ = require('lodash');
var globToRegexp = require('glob-to-regexp');
var $ = require('gulp-load-plugins')();
var fs = require('fs');
var del = require('del');
var constants = require('../common/constants')();

/**
 * Gets the list of application names from the list of index.html files
 * index.html -> app
 * index-web.html -> web
 * index-mobile.html -> mobile
 * @returns {String[]} - The list of application names
 */

function getAppNameFromIndexFiles() {
    var re = globToRegexp('{index-*.html,index.html}', {
        extended: true
    });

    return _.chain(fs.readdirSync('<%= clientFolder%>'))
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

gulp.task('dist', 'Distribute the application.', ['clean', 'browserify', 'style'], function() {
    getAppNameFromIndexFiles().forEach(function(name) {
        gulp.src('./client/scripts/bundle.js')
            .pipe(gulp.dest(path.join(constants.dist.distFolder, name)));
    });
});