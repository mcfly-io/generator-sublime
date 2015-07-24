'use strict';
var path = require('path');
var yeoman = require('yeoman-generator');
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

var GulpsGenerator = yeoman.generators.Base.extend({

    constructor: function() {

        yeoman.generators.Base.apply(this, arguments);
        this.allTasks = [
            'lint',
            'serve',
            'browserify',
            'webpack',
            'release',
            'changelog',
            'test',
            'style',
            'dist'
        ];

        this.npmPackagesVersion = {
            'babel-eslint': '3.1.23',
            'babel': '5.6.14',
            'babel-core': '5.6.15',
            'babel-loader': '5.2.2',
            'babel-runtime': '5.6.15',
            'babelify': '6.1.2',
            'brfs': '1.4.0',
            'browser-sync': '2.7.13',
            'browserify': '10.2.4',
            'browserify-istanbul': '0.2.1',
            'browserify-shim': '3.8.9',
            'bundle-collapser': '1.2.0',
            'chai': '3.0.0',
            'chalk': '1.1.0',
            'codeclimate-test-reporter': 'latest',
            'conventional-changelog': '0.0.17',
            'cssify': '0.7.0',
            'deamdify': '0.1.1',
            'del': '1.2.0',
            'envify': '3.4.0',
            'eslint-plugin-nodeca': '1.0.3',
            'event-stream': '3.3.1',
            'exorcist': '0.4.0',
            'glob-to-regexp': '0.0.1',
            'github': '0.2.4',
            'github-username': '2.0.0',
            'growly': '1.2.0',
            'gulp': '3.9.0',
            'gulp-autoprefixer': '2.3.1',
            'gulp-bump': '0.3.1',
            'gulp-concat': '2.6.0',
            'gulp-eslint': '0.15.0',
            'gulp-exec': '2.1.1',
            'gulp-git': '1.2.4',
            'gulp-help': '1.6.0',
            'gulp-if': '1.2.5',
            'gulp-imagemin': '2.3.0', // may have some issue with installation on node 10
            'gulp-istanbul': '0.10.0',
            'gulp-jscs': '1.6.0',
            'gulp-jshint': '1.11.2',
            'gulp-karma': '0.0.4',
            'gulp-less': '3.0.3',
            'gulp-load-plugins': '1.0.0-rc.1',
            'gulp-minify-css': '1.2.0',
            'gulp-mocha': '2.1.2',
            'gulp-mux': '', // always take latest version as this is our package
            'gulp-order': '1.1.1',
            'gulp-plumber': '1.0.1',
            'gulp-protractor': '1.0.0',
            'gulp-rename': '1.2.2',
            'gulp-sass': '2.0.4',
            'gulp-size': '1.2.3',
            'gulp-sourcemaps': '1.5.2',
            'gulp-tap': '0.1.3',
            'gulp-util': '3.0.6',
            'gulp-webserver': '0.8.7',
            'html-loader': '0.3.0',
            'html2js-browserify': '1.0.0',
            'inquirer': '0.8.5',
            //'imagemin-pngquant': '4.1.0', has some issue with installation on node 10. UPDATED: it is now a dependency of gulp-imagemin
            'isparta': '3.0.3',
            'istanbul': '0.3.17',
            'istanbul-instrumenter-loader': '0.1.3',

            'jadeify': '4.3.0', // cannot accept browserify >= 7.0.0

            'jasmine-reporters': '2.0.7',
            'jasmine-spec-reporter': '2.3.0',

            'jshint-stylish': '2.0.1',

            'karma': '0.12.37',
            'karma-browserify': '4.2.1',
            'karma-coverage': '0.4.2', // version 0.2.7 had an issue — github.com/karma-runner/karma-coverage/issues/119, fixed in 0.4.1
            'karma-growl-reporter': '0.1.1',
            'karma-jasmine': '0.3.6',
            'karma-mocha-reporter': '1.0.2',
            'karma-phantomjs-launcher': '0.2.0',
            'karma-sourcemap-loader': '0.3.5',
            'karma-webpack': '1.5.1',
            'less': '2.5.1',
            'less-loader': '2.2.0',

            'lodash': '3.9.3',

            'map-stream': '0.0.6',
            'mkdirp': '0.5.1',
            'mocha': '2.2.5',
            'mocha-lcov-reporter': '0.0.2',
            'moment': '2.10.3',
            'node-jsxml': '0.6.0',
            'open': '0.0.5',
            'protractor': '2.1.0',
            'protractor-html-screenshot-reporter': 'mping/protractor-html-screenshot-reporter', // version 0.0.19 doesn't support Jasmine 2, using @mping's fork  — github.com/jintoppy/protractor-html-screenshot-reporter/issues/44
            'q': '1.4.1',
            'require-dir': '0.3.0',
            'run-sequence': '1.1.1',
            'sass-loader': '1.0.2',
            'sinon': '1.15.4',
            'stream-combiner': '0.2.2',
            //'streamqueue': '1.1.0',
            'strip-json-comments': '1.0.2',
            'transform-loader': '0.2.2',
            'uglifyify': '3.0.1',
            'vinyl-buffer': '1.0.0',
            'vinyl-source-stream': '1.1.0',
            'vinyl-transform': '1.0.0',
            'watchify': '3.2.3',
            'webpack': '1.10.1',
            'webpack-dev-server': '1.10.1',
            'yargs': '3.14.0'
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
        this.appname = this._.slugify(this._.humanize(this.appname));
    },

    initializing: function() {

        this.pkg = require('../package.json');

        var pkgDest = {};
        try {
            pkgDest = this.dest.readJSON('package.json');
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
                'chalk',
                'codeclimate-test-reporter',
                'event-stream',
                'gulp',
                'gulp-help',
                'gulp-if',
                'gulp-load-plugins',
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
                    'growly',
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
                    'jadeify',
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
                    'sass-loader',
                    'transform-loader',
                    'jadeify',
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
                    'q',
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
                    'q',
                    'yargs'
                ]);
            }
            if (this.test) {
                this.template('tasks/test.js', gulpFolder + '/tasks/test.js');
                npmPackages = npmPackages.concat([
                    'browser-sync',
                    'chai',
                    'gulp-mocha',
                    'gulp-istanbul',
                    'gulp-plumber',
                    'gulp-protractor',
                    'gulp-karma',
                    'istanbul-instrumenter-loader',
                    'isparta',
                    'jasmine-reporters',
                    'jasmine-spec-reporter',
                    'karma',
                    'karma-browserify',
                    'karma-coverage',
                    'karma-growl-reporter',
                    'karma-jasmine',
                    'karma-mocha-reporter',
                    'karma-phantomjs-launcher',
                    'karma-sourcemap-loader',
                    'mocha',
                    'mocha-lcov-reporter',
                    'protractor',
                    'protractor-html-screenshot-reporter',
                    'sinon',
                    'yargs'
                ]);
            }

            if (this.style) {
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
                    'jshint-stylish'
                ]);
            }

            if (this.dist) {
                this.template('tasks/dist.js', gulpFolder + '/tasks/dist.js');
                this.template('tasks/sentry.js', gulpFolder + '/tasks/sentry.js');
                npmPackages = npmPackages.concat([
                    'del',
                    'gulp-rename',
                    'gulp-imagemin',
                    'gulp-tap',
                    'inquirer'
                    //'imagemin-pngquant',
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
        var done = this.async();
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
            }, done);
        });

    },

    end: function() {
        this.log('');
        this.log(chalk.green('Woot!') + ' It appears that everything installed correctly.');
        if (this.lint) {
            this.log('Run the command ' + chalk.yellow('gulp lint') + ' to lint your files.');
        }
        if (this.serve) {
            //this.log('Run the command ' + chalk.yellow('gulp serve') + ' to launch a live reload server.');
            this.log('Run the command ' + chalk.yellow('gulp browsersync') + ' to launch a browsersync server.');
        }
        if (this.browserify) {
            this.log('Run the command ' + chalk.yellow('gulp browserify') + ' to create a browserify bundle.');
        }
        if (this.release) {
            this.log('Run the command ' + chalk.yellow('gulp release') + ' to increment version and publish to npm.');
        }
        if (this.changelog) {
            this.log('Run the command ' + chalk.yellow('gulp changelog') + ' to create a CHANGELOG.md file.');
        }
        if (this.test) {
            this.log('Run the command ' + chalk.yellow('gulp test') + ' to run the tests.');
        }
        if (this.dist) {
            this.log('Run the command ' + chalk.yellow('gulp dist') + ' to distribute the application.');
        }
        if (this.style) {
            this.log('Run the command ' + chalk.yellow('gulp style') + ' to compile style files.');
        }
    }

});

module.exports = GulpsGenerator;
