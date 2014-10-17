'use strict';

var path = require('path');

module.exports = function() {
    var cwd = process.env.INIT_CWD || '';
    var constants = {
        repository: '<%= Repository %>',
        versionFiles: ['./package.json', './bower.json'],
        growly: {
            successIcon: path.join(cwd, 'node_modules/karma-growl-reporter/images/success.png'),
            failedIcon: path.join(cwd, 'node_modules/karma-growl-reporter/images/failed.png')
        },

        lint: ['./client/**/*.js', './server/**/*.js', 'gulpfile.js', 'gulp/**/*.js', 'karam.conf.js', 'test/**/*.js', '!./client/scripts/bundle.js', '!./client/scripts/bundle.min.js'],

        fonts: {
            src: <%=  fonts %>,
            dest: './client/fonts'
        },

        style: {
            src: ['./client/styles/**/*.css', './client/styles/**/*.scss', '!./client/styles/main.css', '!./client/styles/main.min.css'],
            dest: './client/styles',
            destName: 'main.css',
            sass: {
                src: ['./client/styles/main.scss']
            },
            css: {
                src: <%= css %>
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
            port: 9500
        },
        mocha: {
            libs: ['server/**/*.js'],
            tests: ['test/mocha/**/*.js'],
            globals: 'test/mocha/helpers/globals.js',
            timeout: 5000
        }

    };

    return constants;
};