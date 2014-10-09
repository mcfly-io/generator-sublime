'use strict';

var path = require('path');

module.exports = function() {
    var constants = {
        versionFiles: ['./package.json', './bower.json'],

        growly: {
            successIcon: path.join(process.env.INIT_CWD, 'node_modules/karma-growl-reporter/images/success.png'),
            failedIcon: path.join(process.env.INIT_CWD, 'node_modules/karma-growl-reporter/images/failed.png')
        },

        lint: ['./client/**/*.js', './server/**/*.js', 'gulpfile.js', 'gulp/**/*.js', 'karam.conf.js', 'test/**/*.js'],

        style: {
            dest: './client/styles',
            destName: 'main.css',
            sass: {
                src: ['./client/styles/main.scss']
            },
            css: {
                src: ['']
            }
        },

        browserify: {
            src: './client/scripts/main.js',
            dest: './client/scripts',
            bundleName: 'bundle.js'
        },

        serve: {
            root: 'client',
            host: '0.0.0.0',
            livereload: 9000,
            port: 5000
        },
        mocha: {
            libs: ['app/**/*.js'],
            tests: ['test/**/*.js'],
            globals: 'test/helpers/globals.js',
            timeout: 5000
        }

    };

    return constants;
};