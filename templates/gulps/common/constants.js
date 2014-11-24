'use strict';

var path = require('path');

module.exports = function() {
    var cwd = process.env.INIT_CWD || '';
    var clientFolder = '<%= clientFolder%>';
    var constants = {
        cwd: cwd,
        clientFolder: clientFolder,
        repository: '<%= Repository %>',
        versionFiles: ['./package.json', './bower.json', './config.xml'],
        growly: {
            notify: false,
            successIcon: path.join(cwd, 'node_modules/karma-growl-reporter/images/success.png'),
            failedIcon: path.join(cwd, 'node_modules/karma-growl-reporter/images/failed.png')
        },

        lint: ['./' + clientFolder + '/**/*.js', './server/**/*.js', 'gulpfile.js', 'gulp_tasks/**/*.js', 'karam.conf.js', 'test/**/*.js', '!./' + clientFolder + '/scripts/bundle.js', '!./' + clientFolder + '/scripts/bundle.min.js'],

        fonts: {
            src: <%=  fonts %>,
            dest: './' + clientFolder + '/fonts'
        },

        style: {
            src: ['./' + clientFolder + '/styles/**/*.css', './' + clientFolder + '/styles/**/*.scss', '!./' + clientFolder + '/styles/main.css', '!./' + clientFolder + '/styles/main.min.css'],
            dest: './' + clientFolder + '/styles',
            destName: 'main.css',
            sass: {
                src: ['./' + clientFolder + '/styles/main.scss']
            },
            css: {
                src: <%= css %>
            }
        },

        browserify: {
            src: './' + clientFolder + '/scripts/main.js',
            dest: './' + clientFolder + '/scripts',
            bundleName: 'bundle.js'
        },

        serve: {
            root: clientFolder,
            host: '0.0.0.0',
            livereload: 9000,
            port: 9500,
            localtunnel: true // true, false or '<%= appname %>'
        },
        mocha: {
            libs: ['server/**/*.js'],
            tests: ['test/mocha/**/*.js'],
            globals: 'test/mocha/helpers/globals.js',
            timeout: 5000
        },
        dist: {
            distFolder: 'dist'
        }
    };

    return constants;
};