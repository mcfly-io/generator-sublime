'use strict';

var path = require('path');

module.exports = function() {
    var constants = {
        versionFiles: ['./package.json', './bower.json'],
        growly: {
            successIcon: path.join(process.env.INIT_CWD, 'node_modules/karma-growl-reporter/images/success.png'),
            failedIcon: path.join(process.env.INIT_CWD, 'node_modules/karma-growl-reporter/images/failed.png')
        },
        lint: ['app/**/*.js', 'bash/**/*.js', 'gulps/**/*.js', 'gulpfile.js', 'gulp/**/*.js', 'karam.conf.js', 'test/**/*.js'],
        mocha: {
            libs: ['app/**/*.js', 'gulps/**/*.js', 'bash/**/*.js'],
            tests: ['test/**/*.js'],
            globals: 'test/helpers/globals.js',
            timeout: 5000
        }
    };

    return constants;
};