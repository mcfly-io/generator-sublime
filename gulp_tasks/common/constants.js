'use strict';

var path = require('path');

module.exports = function() {
    var constants = {
        repository: 'https://github.com/thaiat/generator-sublime',
        versionFiles: ['./package.json', './bower.json'],
        lint: ['app/**/*.js', 'bash/**/*.js', 'gulps/**/*.js', 'templates/gulps/tasks/**/*.js', '!templates/gulps/tasks/serve.js', 'gulpfile.js', 'gulp_tasks/**/*.js', 'karma.conf.js', 'test/**/*.js'],
        mocha: {
            libs: ['app/**/*.js', 'gulps/**/*.js', 'bash/**/*.js', 'class/**/*.js'],
            tests: ['test/**/*.js'],
            globals: 'test/helpers/globals.js',
            timeout: 5000
        }
    };

    return constants;
};