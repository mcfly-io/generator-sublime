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
        mode: '{{mode}}',
        clientFolder: clientFolder,
        repository: '<%= Repository %>',
        versionFiles: ['./package.json', './bower.json', './config.xml'],
        growly: {
            notify: false,
            successIcon: path.join(cwd, 'node_modules/karma-growl-reporter/images/success.png'),
            failedIcon: path.join(cwd, 'node_modules/karma-growl-reporter/images/failed.png')
        },

        lint: [
            './' + clientFolder + '/scripts/*/**/*.js',
            '!./' + clientFolder + '/scripts/bundle*.js',
            './server/**/*.js', 'gulpfile.js', './gulp_tasks/**/*.js', 'karam.conf.js', './test/**/*.js'
        ],
        fonts: {
            src: <%=  fonts %>, // you can also add a specific src_appname
            dest: './dist/{{targetName}}/{{mode}}/fonts'
        },
        html: {
            src: './' + clientFolder + '/index{{targetSuffix}}.html'
        },
        images: {
            src: [
            './' + clientFolder + '/images/{{targetName}}/**/*', './' + clientFolder + '/images/*.*',
            './' + clientFolder + '/icons/{{targetName}}/**/*', './' + clientFolder + '/icons/*.*'
            ]
        },
        style: {
            src: [
                './' + clientFolder + '/styles/main{{targetSuffix}}.scss'
            ],
            dest: './dist/{{targetName}}/{{mode}}/styles',
            destName: 'main.css',
            sass: {
                src: ['./' + clientFolder + '/styles/main{{targetSuffix}}.scss']
            },
            css: {
                src: <%= css %>  // you can also add a specific src_appname
            }
        },

        browserify: {
            src: './' + clientFolder + '/scripts/main{{targetSuffix}}.js',
            dest: './dist/{{targetName}}/{{mode}}/scripts',
            bundleName: 'bundle.js'
        },

        serve: {
            root: 'dist/{{targetName}}/{{mode}}',
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
            distFolder: './dist/{{targetName}}/{{mode}}'
        }
    };

    return constants;
};