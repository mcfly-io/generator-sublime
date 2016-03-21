'use strict';
var path = require('path');
var generators = require('yeoman-generator');
var _ = require('lodash');
var chalk = require('chalk');

var sortObject = function(object) {
    var sortedObj = {};
    var keys = _.keys(object);

    keys = _.sortBy(keys, function(key) {
        return key;
    });

    _.each(keys, function(key) {
        if (typeof object[key] === 'object' && !(object[key] instanceof Array)) {
            sortedObj[key] = sortObject(object[key]);
        } else {
            sortedObj[key] = object[key];
        }
    });

    return sortedObj;
};

var GulpsGenerator = generators.Base.extend({

    constructor: function() {

        generators.Base.apply(this, arguments);
        this.allTasks = [
            'lint',
            'serve',
            'browserify',
            'webpack',
            'release',
            'changelog',
            'test',
            'style',
            'dist',
            'graph'
        ];

        this.npmPackagesVersion = {
            'babel': '5.8.29',
            'babel-core': '5.8.33',
            'babel-eslint': '5.0.0',
            'babel-loader': '5.3.3',
            'babel-runtime': '5.8.29',
            'babelify': '6.4.0',
            'bluebird': '3.0.5',
            'brfs': '1.4.1',
            'browser-sync': '2.10.0',
            'browserify': '12.0.1',
            'browserify-istanbul': '0.2.1',
            'browserify-resolutions': '1.0.6',
            'browserify-shim': '3.8.11',
            'bundle-collapser': '1.2.1',
            'chai': '3.4.1',
            'chalk': '1.1.1',
            'codeclimate-test-reporter': 'latest',
            'conventional-changelog': '0.5.1',
            'cssify': '0.8.0',
            'deamdify': '0.1.1',
            'del': '2.1.0',
            'fast-csv': '0.6.0',
            'envify': '3.4.0',
            'eslint-plugin-nodeca': '1.0.3',
            'esprima': '^2.4.1',
            'event-stream': '3.3.2',
            'exorcist': '0.4.0',
            'glob-to-regexp': '0.0.1',
            'github': '0.2.4',
            'github-username': '2.1.0',
            'graphviz': '0.0.8',
            'gulp': '3.9.1',
            'gulp-autoprefixer': '3.1.0',
            'gulp-bump': '1.0.0',
            'gulp-concat': '2.6.0',
            'gulp-eslint': '1.1.0',
            'gulp-exec': '2.1.2',
            'gulp-git': '1.6.0',
            'gulp-help': '1.6.1',
            'gulp-if': '2.0.0',
            'gulp-imagemin': '2.4.0', // may have some issue with installation on node 10
            'gulp-istanbul': '0.10.2',
            'gulp-jscs': '3.0.2',
            'gulp-jshint': '1.12.0',
            'gulp-less': '3.0.3',
            'gulp-minify-css': '1.2.1',
            'gulp-mocha': '2.2.0',
            'gulp-mux': '', // always take latest version as this is our package
            'gulp-order': '1.1.1',
            'gulp-plumber': '1.0.1',
            'gulp-protractor': '1.0.0',
            'gulp-rename': '1.2.2',
            'gulp-replace': '0.5.4',
            'gulp-sass': '2.1.0',
            'gulp-size': '2.0.0',
            'gulp-sourcemaps': '1.6.0',
            'gulp-tap': '0.1.3',
            'gulp-util': '3.0.7',
            'gulp-webserver': '0.8.7',
            'html-loader': '0.3.0',
            'html2js-browserify': '1.1.0',
            'ionic-app-lib': '0.6.4',
            'ionic-platform-web-client': '0.2.1',
            'inquirer': '0.11.0',
            //'imagemin-pngquant': '4.1.0', has some issue with installation on node 10. UPDATED: it is now a dependency of gulp-imagemin
            'isparta': '4.0.0',
            'istanbul': '0.4.0',
            'istanbul-instrumenter-loader': '0.1.3',

            //'jadeify': '4.4.0', // cannot accept browserify >= 7.0.0

            'jasmine-reporters': '2.0.7',
            'jasmine-spec-reporter': '2.4.0',

            'jshint-stylish': '2.1.0',

            'karma': '0.13.15',
            'karma-browserify': '4.4.0',
            'karma-coverage': '0.5.3', // version 0.2.7 had an issue — github.com/karma-runner/karma-coverage/issues/119, fixed in 0.4.1
            'karma-jasmine': '0.3.6',
            'karma-mocha-reporter': '1.1.1',
            'karma-phantomjs-launcher': '0.2.1',
            'karma-sourcemap-loader': '0.3.6',
            'karma-webpack': '1.7.0',
            'less': '2.5.3',
            'less-loader': '2.2.1',

            'lodash': '3.10.1',

            'map-stream': '0.0.6',
            'mkdirp': '0.5.1',
            'mocha': '2.3.3',
            'mocha-lcov-reporter': '1.0.0',
            'moment': '2.10.6',
            'node-jsxml': '0.6.0',
            'node-sass': '3.4.1',
            'open': '0.0.5',
            'phantomjs': '1.9.18',
            'protractor': '2.5.1',
            'protractor-istanbul-plugin': '2.0.0',
            'protractor-jasmine2-screenshot-reporter': '0.1.7', //'mping/protractor-html-screenshot-reporter' does not work anymore, // version 0.0.19 doesn't support Jasmine 2, using @mping's fork  — github.com/jintoppy/protractor-html-screenshot-reporter/issues/44
            'require-dir': '0.3.0',
            'rimraf': '2.4.3',
            'run-sequence': '1.1.4',
            'sass-loader': '3.1.1',
            'sinon': '1.17.2',
            'stream-combiner': '0.2.2',
            //'streamqueue': '1.1.0',
            'strip-json-comments': '1.0.4',
            'transform-loader': '0.2.3',
            'uglifyify': '3.0.1',
            'vinyl-buffer': '1.0.0',
            'vinyl-source-stream': '1.1.0',
            'vinyl-transform': '1.0.0',
            'watchify': '3.6.0',
            'webpack': '1.12.6',
            'webpack-dev-server': '1.12.1',
            'yargs': '3.30.0'
        };

        this.option('clientFolder', {
            desc: 'client folder',
            type: 'String'
        });

        this.option('ionic', {
            desc: 'ionic',
            type: 'Boolean',
            defaults: false
        });
        this.option('famous', {
            desc: 'famo.us',
            type: 'Boolean',
            defaults: false
        });
        this.option('fontawesome', {
            desc: 'font-awseome',
            type: 'Boolean',
            defaults: false
        });
        this.option('bootstrap', {
            desc: 'bootstrap',
            type: 'Boolean',
            defaults: false
        });
        this.option('material', {
            desc: 'angular-material',
            type: 'Boolean',
            defaults: false
        });

        _.forEach(this.allTasks, function(task) {
            this.option(task, {
                desc: task,
                type: 'Boolean'
            });
        }.bind(this));

        this.appname = this.appname || path.basename(process.cwd());
        this.appname = _.snakeCase(this.appname);
    },

    initializing: function() {

        this.pkg = require('../package.json');

        var pkgDest = {};
        try {
            pkgDest = this.readJsonFile(this.destinationPath('package.json'));
        } catch (e) {}

        this.pkgDest = pkgDest;

        this.clientFolder = this.options.clientFolder;
        this.ionic = this.options.ionic;
        this.famous = this.options.famous;
        this.fontawesome = this.options.fontawesome;
        this.bootstrap = this.options.bootstrap;
        this.material = this.options.material;

        _.forEach(this.allTasks, function(task) {
            this[task] = this.options[task];
        }.bind(this));

        //this._buildCssList();
        this._buildFontsList();
    },

    // _buildCssList: function() {
    //     var css = [];
    //     if(this.famous) {
    //         //css.push('\'./bower_components/famous/famous.css\'');
    //         css.push('\'./bower_components/famous-angular/dist/famous-angular.css\'');
    //     }
    //     if(this.bootstrap) {
    //         css.push('\'./bower_components/bootstrap/dist/css/bootstrap.css\'');
    //         css.push('\'./bower_components/bootstrap/dist/css/bootstrap-theme.css\'');
    //     }
    //     if(this.material) {
    //         css.push('\'./bower_components/angular-material/angular-material.css\'');
    //     }
    //     css = css.length > 0 ? css : ['\'\''];
    //     this.css = '[' + css.join(', ') + ']';

    // },

    _buildFontsList: function() {
        var fonts = [];
        fonts.push('\'./\' + clientFolder + \'/fonts/*.*\'');
        fonts.push('\'./\' + clientFolder + \'/fonts/{{targetName}}/**/*.*\'');

        if (this.ionic) {
            fonts.push('\'./node_modules/ionic-sdk/release/fonts/*.*\'');
        }
        if (this.fontawesome) {
            fonts.push('\'./node_modules/font-awesome/fonts/*.*\'');
        }
        if (this.bootstrap) {
            fonts.push('\'./node_modules/bootstrap/dist/fonts/*.*\'');
        }
        fonts = fonts.length > 0 ? fonts : [];
        this.fonts = '[' + fonts.join(', ') + ']';
    },

    prompting: {

        askFor: function() {

            var done = this.async();
            var that = this;
            var choices = this.allTasks.map(function(task) {
                return {
                    name: task,
                    value: task,
                    checked: false
                };
            });
            var hasTaskOption = false;
            _.forEach(that.allTasks, function(task) {
                if (that.options[task] === true) {
                    hasTaskOption = true;
                }
            });

            var prompts = [{
                name: 'clientFolder',
                message: 'What is your client folder?',
                when: function() {
                    return that.clientFolder === undefined || !_.isString(that.clientFolder);
                },
                validate: function(input) {
                    var isValid = input !== undefined && input.length > 0;
                    if (!isValid) {
                        return 'You must input an non empty value';
                    }

                    return true;
                }
            }, {
                type: 'checkbox',
                name: 'Tasks',
                message: 'What gulp tasks do you need ?',
                when: function() {
                    return !hasTaskOption;
                },
                choices: choices
            }, {
                name: 'Repository',
                message: 'What is the url of your repository?',
                default: 'https://github.com/user/repo',
                when: function(answers) {
                    var values = answers.Tasks;
                    return _.contains(values, 'changelog') || that.options.changelog === true;
                }
            }];

            this.prompt(prompts, function(answers) {
                this.Tasks = answers.Tasks = [].concat(answers.Tasks);
                this.Repository = answers.Repository;
                this.clientFolder = this.clientFolder || answers.clientFolder;
                var hasListOption = function(list, option) {
                    return answers[list].indexOf(option) !== -1;
                };

                choices.forEach(function(choice) {
                    if (this[choice.value] === undefined) {
                        this[choice.value] = hasListOption('Tasks', choice.value);
                    }
                }.bind(this));

                done();
            }.bind(this));
        }
    },

    writing: {
        projectFiles: function() {
            this.npmPackages = null;
            var done = this.async();
            if (this.Tasks.length <= 0) {
                this.log(chalk.bold.yellow('You didn\'t select any gulp task'));
                done();
                return;
            }

            var npmPackages = [
                'bluebird',
                'chalk',
                'codeclimate-test-reporter',
                'event-stream',
                'gulp',
                'gulp-help',
                'gulp-if',
                'gulp-mux',
                'gulp-util',
                'lodash',
                'node-jsxml',
                'moment',
                'require-dir',
                'run-sequence',
                'strip-json-comments'
            ];

            var gulpFolder = 'gulp_tasks';

            this.sourceRoot(path.join(__dirname, '../templates/gulps'));

            this.template('gulpfile.js', 'gulpfile.js');
            this.template('common/constants.js', gulpFolder + '/common/constants.js');
            this.template('common/helper.js', gulpFolder + '/common/helper.js');

            if (this.lint || this.test) {
                this.template('tasks/lint.js', gulpFolder + '/tasks/lint.js');
                npmPackages = npmPackages.concat([
                    'babel-eslint',
                    'eslint-plugin-nodeca',
                    'gulp-eslint',
                    'gulp-jshint',
                    'gulp-jscs',
                    'gulp-plumber',
                    'jshint-stylish',
                    'map-stream',
                    'stream-combiner'
                ]);
            }
            if (this.serve) {
                this.template('tasks/serve.js', gulpFolder + '/tasks/serve.js');
                npmPackages = npmPackages.concat([
                    //'gulp-webserver',
                    //'open',
                    'browser-sync'
                ]);
            }
            if (this.browserify) {
                this.template('tasks/browserify.js', gulpFolder + '/tasks/browserify.js');
                npmPackages = npmPackages.concat([
                    'brfs',
                    'browser-sync',
                    'browserify',
                    'browserify-istanbul',
                    'browserify-resolutions',
                    'browserify-shim',
                    'bundle-collapser',
                    'babelify',
                    'cssify',
                    'deamdify',
                    'del',
                    'envify',
                    'exorcist',
                    'html2js-browserify',
                    'isparta',
                    'istanbul',
                    //'jadeify',
                    'mkdirp',
                    'uglifyify',
                    'vinyl-buffer',
                    'vinyl-source-stream',
                    'vinyl-transform',
                    'watchify'
                ]);
            }
            if (this.webpack) {
                this.template('tasks/webpack.js', gulpFolder + '/tasks/webpack.js');
                npmPackages = npmPackages.concat([
                    'babel',
                    'babel-core',
                    'babel-loader',
                    'babel-runtime',
                    'brfs',
                    'webpack',
                    'webpack-dev-server',
                    'bundle-collapser',
                    'del',
                    'envify',
                    'exorcist',
                    'html-loader',
                    'isparta',
                    'istanbul',
                    'istanbul-instrumenter-loader',
                    'karma-sourcemap-loader',
                    'karma-webpack',
                    'less',
                    'less-loader',
                    'node-sass',
                    'sass-loader',
                    'transform-loader',
                    //'jadeify',
                    'mkdirp',
                    'vinyl-buffer',
                    'vinyl-source-stream',
                    'vinyl-transform'
                ]);
            }
            if (this.release) {
                this.template('tasks/release.js', gulpFolder + '/tasks/release.js');
                npmPackages = npmPackages.concat([
                    'del',
                    'github',
                    'github-username',
                    'gulp-bump',
                    'gulp-git',
                    'gulp-if',
                    'gulp-tap',
                    'inquirer',
                    'yargs'
                ]);
            }

            if (this.changelog) {
                this.template('tasks/changelog.js', gulpFolder + '/tasks/changelog.js');
                this.template('common/changelog-script.js', gulpFolder + '/common/changelog-script.js');
                npmPackages = npmPackages.concat([
                    'conventional-changelog',
                    'event-stream',
                    'gulp-exec',
                    'gulp-concat',
                    'gulp-order',
                    'yargs'
                ]);
            }
            if (this.test) {
                this.template('tasks/test.js', gulpFolder + '/tasks/test.js');
                this.template('tasks/csv.js', gulpFolder + '/tasks/csv.js');
                npmPackages = npmPackages.concat([
                    'bluebird',
                    'browserify-resolutions',
                    'browser-sync',
                    'chai',
                    'fast-csv',
                    'gulp-mocha',
                    'gulp-istanbul',
                    'gulp-plumber',
                    'gulp-protractor',
                    'istanbul-instrumenter-loader',
                    'isparta',
                    'jasmine-reporters',
                    'jasmine-spec-reporter',
                    'karma',
                    'karma-browserify',
                    'karma-coverage',
                    'karma-jasmine',
                    'karma-mocha-reporter',
                    'karma-phantomjs-launcher',
                    'karma-sourcemap-loader',
                    'mocha',
                    'mocha-lcov-reporter',
                    'phantomjs',
                    'protractor',
                    'protractor-istanbul-plugin',
                    'protractor-jasmine2-screenshot-reporter',
                    'rimraf',
                    'sinon',
                    'yargs'
                ]);
            }

            if (this.style || this.serve) {
                this.template('tasks/style.js', gulpFolder + '/tasks/style.js');
                npmPackages = npmPackages.concat([
                    'event-stream',
                    'gulp-sass',
                    'gulp-less',
                    'gulp-sourcemaps',
                    'gulp-autoprefixer',
                    'gulp-minify-css',
                    'gulp-order',
                    'gulp-rename',
                    'gulp-concat',
                    'gulp-size',
                    'jshint-stylish',
                    'node-sass'
                ]);
            }

            if (this.dist || this.serve) {
                this.template('tasks/dist.js', gulpFolder + '/tasks/dist.js');
                this.template('tasks/sentry.js', gulpFolder + '/tasks/sentry.js');
                this.template('tasks/ionic.js', gulpFolder + '/tasks/ionic.js');
                npmPackages = npmPackages.concat([
                    'bluebird',
                    'del',
                    'gulp-rename',
                    'gulp-imagemin',
                    'gulp-rename',
                    'gulp-replace',
                    'gulp-tap',
                    'ionic-app-lib',
                    'ionic-platform-web-client',
                    'inquirer',
                    'mkdirp'
                    //'imagemin-pngquant',
                ]);
            }

            if (this.graph) {
                this.template('tasks/graph.js', gulpFolder + '/tasks/graph.js');
                npmPackages = npmPackages.concat([
                    'esprima',
                    'graphviz',
                    'inquirer'
                ]);
            }
            this.npmPackages = _.uniq(npmPackages);

            var gulpsDeps = {
                'devDependencies': _(this.npmPackagesVersion)
                    .pick(this.npmPackages)
                    .value()
            };
            this.gulpsDepsString = JSON.stringify(sortObject(gulpsDeps), null, 2);
            this.template('_gulps-package.json', '.gulps-package.json');
            done();
        }

    },

    install: function() {

        if (!this.npmPackages) {
            return;
        }
        var that = this;
        //var done = this.async();
        var packagesToInstall = _(this.npmPackages)
            .map(function(p) {
                var version = that.npmPackagesVersion[p];
                if (version === undefined) {
                    var err = new Error('Unknown package ' + p);
                    that.emit('error', err);
                }
                if (version.length > 0) {
                    version = '@' + version;
                }
                return p + version;
            }).value();

        var requiresSocketIo = function(packageString) {
            return packageString.indexOf('browser-sync') >= 0 || packageString.indexOf('webpack-dev-server') >= 0 || packageString.indexOf('karma') >= 0;
        };
        var socketIoPackages = _.remove(packagesToInstall, requiresSocketIo);

        this.npmInstall(packagesToInstall, {
            'saveDev': true,
            'saveExact': true
        }, function() {
            that.npmInstall(socketIoPackages, {
                'saveDev': true,
                'saveExact': true
            });
        });

    },

    end: function() {
        this.log('');
        this.log(chalk.green('Woot generator-sublime:gulps!') + ' It appears that everything installed correctly.');
        // if (this.lint) {
        //     this.log('Run the command ' + chalk.yellow('gulp lint') + ' to lint your files.');
        // }
        // if (this.serve) {
        //     //this.log('Run the command ' + chalk.yellow('gulp serve') + ' to launch a live reload server.');
        //     this.log('Run the command ' + chalk.yellow('gulp browsersync') + ' to launch a browsersync server.');
        // }
        // if (this.browserify) {
        //     this.log('Run the command ' + chalk.yellow('gulp browserify') + ' to create a browserify bundle.');
        // }
        // if (this.release) {
        //     this.log('Run the command ' + chalk.yellow('gulp release') + ' to increment version and publish to npm.');
        // }
        // if (this.changelog) {
        //     this.log('Run the command ' + chalk.yellow('gulp changelog') + ' to create a CHANGELOG.md file.');
        // }
        // if (this.test) {
        //     this.log('Run the command ' + chalk.yellow('gulp test') + ' to run the tests.');
        // }
        // if (this.dist) {
        //     this.log('Run the command ' + chalk.yellow('gulp dist') + ' to distribute the application.');
        // }
        // if (this.style) {
        //     this.log('Run the command ' + chalk.yellow('gulp style') + ' to compile style files.');
        // }
    }

});

module.exports = GulpsGenerator;
