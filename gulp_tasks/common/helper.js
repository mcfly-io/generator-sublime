'use strict';

var gulp = require('gulp');
var fs = require('fs');
var gutil = require('gulp-util');
var chalk = require('chalk');
var stripJsonComments = require('strip-json-comments');
var _ = require('lodash');
var es = require('event-stream');
var path = require('path');

/**
 * Returns true if the target application is mobile
 * It checks the presence of a cordova config file
 * @param  {Object}  constants - The constants
 * @returns {Boolean} - True if the target app is mobile, false otherwise
 */
var isMobile = function(constants) {
    return fs.existsSync('./' + constants.clientFolder + '/config' + constants.targetSuffix + '.xml');
};

/**
 * A generic handler for require('child_process').exec
 * @param  {Object} err - The error object
 * @param  {String} stdout - The stdout string
 * @param  {String} stderr - The stderr string
 */
var execHandler = function(err, stdout, stderr) {
    if (err) {
        gutil.log(chalk.red('An error occured executing a command line action'));
    }
    if (stdout) {
        gutil.log(stdout);
    }
    if (stderr) {
        gutil.log(chalk.red('Error: ') + stderr);
    }
};

var readTextFile = function(filename) {
    var body = fs.readFileSync(filename, 'utf8');
    return body;
};

var readJsonFile = function(filename) {
    var body = readTextFile(filename);
    return JSON.parse(stripJsonComments(body));
};

var filterFiles = function(files, extension) {
    return _.filter(files, function(file) {
        return path.extname(file) === extension;
    });
};

/**
 * Add new sources in a gulp pipeline
 * @returns {Stream} A gulp stream
 * @example
 * gulp.src('')
 * .pipe(addSrc('CHANGELOG.md'))
 * .gulp.dest();
 */
var addSrc = function() {
    var pass = es.through();
    return es.duplex(pass, es.merge(gulp.src.apply(gulp.src, arguments), pass));
};

module.exports = {
    isMobile: isMobile,
    execHandler: execHandler,
    readTextFile: readTextFile,
    readJsonFile: readJsonFile,
    filterFiles: filterFiles,
    addSrc: addSrc
};
