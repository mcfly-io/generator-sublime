'use strict';

var path = require('path');

module.exports = function() {
    var cwd = process.env.INIT_CWD || '';
    var clientFolder = '<%= clientFolder%>'; // the source file folder
    var defaultTarget = 'app'; // the name of the app that corresponds to index.html
    var constants = {
        cwd: cwd,
        defaultTarget: defaultTarget,
        targetName: '{{targetName}}',
        targetSuffix: '{{targetSuffix}}',
        clientFolder: clientFolder,
        repository: '<%= Repository %>',
        versionFiles: ['./package.json', './bower.json', './config.xml'],
        growly: {
            notify: false,
            successIcon: path.join(cwd, 'node_modules/karma-growl-reporter/images/success.png'),
            failedIcon: path.join(cwd, 'node_modules/karma-growl-reporter/images/failed.png')
        },

        lint: ['./' + clientFolder + '/**/*.js', '!./' + clientFolder + '/**/*-*.js', './' + clientFolder + '/**/*{{targetSuffix}}.js', './server/**/*.js', 'gulpfile.js', 'gulp_tasks/**/*.js', 'karam.conf.js', 'test/**/*.js', '!test/**/*-*.js', 'test/**/*{{targetSuffix}}.js', '!./' + clientFolder + '/scripts/bundle*.js', '!./' + clientFolder + '/scripts/bundle*.min.js'],
        fonts: {
            src: <%=  fonts %>,
            dest: './' + clientFolder + '/fonts'
        },

        style: {
            src: ['./' + clientFolder + '/styles/**/*.css', '!./' + clientFolder + '/styles/**/*-*.css', './' + clientFolder + '/styles/**/*{{targetSuffix}}.css', './' + clientFolder + '/styles/**/*.scss', '!./' + clientFolder + '/styles/**/*-*.scss', './' + clientFolder + '/styles/**/*{{targetSuffix}}.scss', '!./' + clientFolder + '/styles/main*.css', '!./' + clientFolder + '/styles/main*.min.css'],
            dest: './' + clientFolder + '/styles',
            destName: 'main{{targetSuffix}}.css',
            sass: {
                src: ['./' + clientFolder + '/styles/main{{targetSuffix}}.scss']
            },
            css: {
                src: <%= css %>
            }
        },

        browserify: {
            src: './' + clientFolder + '/scripts/main{{targetSuffix}}.js',
            dest: './' + clientFolder + '/scripts',
            bundleName: 'bundle{{targetSuffix}}.js'
        },

        serve: {
            root: 'dist/{{targetName}}',
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
            distFolder: 'dist/{{targetName}}/'
        }
    };

    return constants;
};