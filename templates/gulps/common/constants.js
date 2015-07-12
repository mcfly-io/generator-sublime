'use strict';

var path = require('path');

var getRepository = function() {
    var repository = '<%= Repository %>';
    try {
        var helper = require('./helper');
        var packageJson = helper.readJsonFile('./package.json');
        var _ = require('lodash');
        if (_.isString(packageJson.repository)) {
            repository = packageJson.repository.replace('.git', '');
        } else {
            repository = packageJson.repository.url.replace('.git', '');
        }
    } catch(err) {}
    return repository;
};

var getAppname = function() {
    var appname;
    try {
        var helper = require('./helper');
        var packageJson = helper.readJsonFile('./package.json');
        appname = packageJson.name;
    } catch(err) {}
    return appname;
};

module.exports = function() {
    var cwd = process.env.INIT_CWD || '';
    var clientFolder = '<%= clientFolder%>'; // the source file folder
    var defaultTarget = 'app'; // the name of the app that corresponds to index.html
    var constants = {
        cwd: cwd,
        appname: getAppname(),
        defaultTarget: defaultTarget,
        targetName: '{{targetName}}',
        targetSuffix: '{{targetSuffix}}',
        mode: '{{mode}}',
        clientFolder: clientFolder,
        repository: getRepository(),
        versionFiles: ['./package.json', './bower.json', './' + clientFolder + '/config*.xml'],
        growly: {
            notify: false,
            successIcon: path.join(cwd, 'node_modules/karma-growl-reporter/images/success.png'),
            failedIcon: path.join(cwd, 'node_modules/karma-growl-reporter/images/failed.png')
        },
        cordova: {
            src: './' + clientFolder + '/cordova/{{targetName}}',
            icon: './' + clientFolder + '/icons/{{targetName}}/icon.png',
            splash: './' + clientFolder + '/icons/{{targetName}}/splash.png',
            platform: 'ios',
            iconBackground: '#fff'
        },
        lint: [
            './' + clientFolder + '/scripts/**/*.js',
            '!./' + clientFolder + '/scripts/bundle*.js',
            '!./' + clientFolder + '/scripts/lbServices.js',
            './server/**/*.js', 'gulpfile.js', './gulp_tasks/**/*.js', 'karma.conf.js', './test/**/*.js'
        ],
        fonts: {
            src: <%= fonts %>, // you can also add a specific src_appname
            dest: 'fonts'
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
            watchFolder: ['./' + clientFolder + '/styles/**/*.scss', './' + clientFolder + '/styles/**/*.less'],
            dest: 'styles',
            destName: 'main.css',
            sass: {
                src: ['./' + clientFolder + '/styles/main{{targetSuffix}}.scss']
            },
            less: {
                src: ['./' + clientFolder + '/styles/main{{targetSuffix}}.less']
            }
        },
        script: {
            dest: 'scripts'
        },
        browserify: {
            src: './' + clientFolder + '/scripts/main{{targetSuffix}}.js'
        },
        webpack: {
            src: './main{{targetSuffix}}.js'
        },
        exorcist: {
            dest: 'srcmaps',
            mapExtension: '.map.js'
        },
        sentry: {
            targetKeys: {
                app: ''
            },
            normalizedURL: true, // true, false, or an url. When true it will default to 'http://localhost:' + serve.port
            organizationName: '',
            auth: ''
        },
        ionic: {
            app: {
                app_id: '',
                api_key: '',
                name: ''
            }
        },
        serve: {
            host: 'localhost', //'0.0.0.0',
            port: 5000,
            open: true,
            browser: ['google chrome'], // ['google chrome', 'firefox'],
            localtunnel: false, // true, false or '<%= appname %>'
            ghostMode: {
                clicks: false,
                forms: false,
                scroll: false
            }
        },
        mocha: {
            libs: ['server/**/*.js'],
            tests: ['test/mocha/**/*.js'],
            globals: 'test/mocha/helpers/globals.js',
            timeout: 5000
        },
        e2e: {
            src: ['./test/e2e/{{targetName}}/**/*test.js'],
            port: 5555,
            configFile: 'protractor.conf.js'
        },
        dist: {
            distFolder: './dist/{{targetName}}/{{mode}}'
        },
        testfairy: {
            api_key: '',
            ios_app_token: '',
            metrics: 'cpu,network,logcat,memory,battery,gps',
            testersGroups: 'all',
            maxDuration: '15m',
            autoUpdate: 'on',
            iconWatermark: 'on'
        },
        moduleManager: 'browserify' // or webpack
    };

    return constants;
};
