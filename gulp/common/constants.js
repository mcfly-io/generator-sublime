'use strict';

module.exports = function() {
    var constants = {
        versionFiles: ['./package.json', './bower.json'],
        growly: {
            successIcon: 'node_modules/karma-growl-reporter/images/success.png',
            failedIcon: 'node_modules/karma-growl-reporter/images/failed.png'
        },
        lint: ['app/**/*.js', 'bash/**/*.js', 'gulps/**/*.js', 'gulpfile.js', 'gulp/**/*.js', 'karam.conf.js', 'test/**/*.js']
    };

    return constants;
};