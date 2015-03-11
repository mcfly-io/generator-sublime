'use strict';
var path = require('path');
var yeoman = require('yeoman-generator');
var _ = require('lodash');
var chalk = require('chalk');

var GulpsGenerator = yeoman.generators.Base.extend({

    constructor: function() {

        yeoman.generators.Base.apply(this, arguments);
        this.allTasks = [
            'lint',
            'serve',
            'browserify',
            'release',
            'changelog',
            'test',
            'style',
            'dist'
        ];

        this.npmPackagesVersion = {
            'brfs': '1.2.0',
            'browser-sync': '1.7.2',
            'browserify': '6.3.3',
            'browserify-istanbul': '0.1.2',
            'browserify-shim': '3.8.0',
            'chai': '1.10.0',
            'chalk': '0.5.1',
            'conventional-changelog': '0.0.11',
            'cssify': '0.6.0',
            'deamdify': '0.1.1',
            'del': '1.1.1',
            'event-stream': '3.1.7',
            'glob-to-regexp': '0.0.1',
            'github': '0.2.3',
            'github-username': '1.1.1',
            'growly': '1.1.1',
            'gulp': '3.8.10',
            'gulp-autoprefixer': '2.0.0',
            'gulp-bump': '0.1.11',
            'gulp-concat': '2.4.2',
            'gulp-eslint': '0.6.0',
            'gulp-exec': '2.1.1',
            'gulp-git': '0.5.5',
            'gulp-help': '1.3.1',
            'gulp-if': '1.2.5',
            'gulp-imagemin': '2.1.0',
            'gulp-istanbul': '0.4.0',
            'gulp-jscs': '1.3.1',
            'gulp-jshint': '1.9.0',
            'gulp-karma': '0.0.4',
            'gulp-load-plugins': '0.7.1',
            'gulp-minify-css': '0.5.1',
            'gulp-mocha': '2.0.0',
            'gulp-mux': '', // always take latest version as this is our package
            'gulp-order': '1.1.1',
            'gulp-plumber': '0.6.6',
            'gulp-protractor': '0.0.12',
            'gulp-rename': '1.2.0',
            'gulp-sass': '1.1.0',
            'gulp-size': '1.1.0',
            'gulp-sourcemaps': '1.2.8',
            'gulp-tap': '0.1.3',
            'gulp-uglify': '1.0.2',
            'gulp-util': '3.0.1',
            'gulp-webserver': '0.8.7',
            'html2js-browserify': '0.0.2',
            'inquirer': '0.8.0',
            'jadeify': '3.0.0', // cannot accept browserify >= 7.0.0

            'jasmine-reporters': '1.0.1',
            'jasmine-spec-reporter': '1.1.0',

            'jshint-stylish': '1.0.0',

            'karma': '0.12.28',
            'karma-browserify': '2.0.0',
            'karma-coverage': '0.2.6', // version 0.2.7 has an issue : https://github.com/karma-runner/karma-coverage/issues/119
            'karma-growl-reporter': '0.1.1',
            'karma-jasmine': '0.3.2',
            'karma-mocha-reporter': '0.3.1',
            'karma-phantomjs-launcher': '0.1.4',

            'lodash': '2.4.1',

            'map-stream': '0.0.5',
            'mocha': '2.0.1',
            'mocha-lcov-reporter': '0.0.1',
            'node-jsxml': '0.6.0',
            'open': '0.0.5',
            'protractor': '1.5.0',
            'protractor-html-screenshot-reporter': '0.0.17',
            'q': '1.1.2',
            'require-dir': '0.1.0',
            'run-sequence': '1.0.2',
            'sinon': '1.12.1',
            'stream-combiner': '0.2.1',
            'streamqueue': '0.1.1',
            'strip-json-comments': '1.0.2',
            'vinyl-source-stream': '1.0.0',
            'vinyl-buffer': '1.0.0',
            'watchify': '2.1.1',
            'yargs': '1.3.3'
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
        } catch(e) {}

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

        this._buildCssList();
        this._buildFontsList();
    },

    _buildCssList: function() {
        var css = [];
        if(this.famous) {
            //css.push('\'./bower_components/famous/famous.css\'');
            css.push('\'./bower_components/famous-angular/dist/famous-angular.css\'');
        }
        if(this.bootstrap) {
            css.push('\'./bower_components/bootstrap/dist/css/bootstrap.css\'');
            css.push('\'./bower_components/bootstrap/dist/css/bootstrap-theme.css\'');
        }
        if(this.material) {
            css.push('\'./bower_components/angular-material/angular-material.css\'');
        }
        css = css.length > 0 ? css : ['\'\''];
        this.css = '[' + css.join(', ') + ']';

    },

    _buildFontsList: function() {
        var fonts = [];
        fonts.push('\'./\' + clientFolder + \'/fonts/*.*\'');
        fonts.push('\'./\' + clientFolder + \'/fonts/{{targetName}}/**/*.*\'');

        if(this.ionic) {
            fonts.push('\'./bower_components/ionic/release/fonts/*.*\'');
        }
        if(this.fontawesome) {
            fonts.push('\'./bower_components/font-awesome/fonts/*.*\'');
        }
        if(this.bootstrap) {
            fonts.push('\'./bower_components/bootstrap/dist/fonts/*.*\'');
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
                if(that.options[task] === true) {
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
                    if(!isValid) {
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
                    if(this[choice.value] === undefined) {
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
            if(this.Tasks.length <= 0) {
                this.log(chalk.bold.yellow('You didn\'t select any gulp task'));
                done();
                return;
            }

            var npmPackages = [
                'chalk',
                'gulp',
                'gulp-help',
                'gulp-if',
                'gulp-load-plugins',
                'gulp-mux',
                'gulp-util',
                'lodash',
                'require-dir',
                'run-sequence',
                'strip-json-comments'
            ];

            var gulpFolder = 'gulp_tasks';

            this.sourceRoot(path.join(__dirname, '../templates/gulps'));

            this.template('gulpfile.js', 'gulpfile.js');
            this.template('common/constants.js', gulpFolder + '/common/constants.js');
            this.template('common/helper.js', gulpFolder + '/common/helper.js');

            if(this.lint || this.test) {
                this.template('tasks/lint.js', gulpFolder + '/tasks/lint.js');
                npmPackages = npmPackages.concat([
                    'growly',
                    'gulp-eslint',
                    'gulp-jshint',
                    'gulp-jscs',
                    'gulp-plumber',
                    'map-stream',
                    'stream-combiner'
                ]);
            }
            if(this.serve) {
                this.template('tasks/serve.js', gulpFolder + '/tasks/serve.js');
                npmPackages = npmPackages.concat([
                    //'gulp-webserver',
                    //'open',
                    'browser-sync'
                ]);
            }
            if(this.browserify) {
                this.template('tasks/browserify.js', gulpFolder + '/tasks/browserify.js');
                npmPackages = npmPackages.concat([
                    'brfs',
                    'browser-sync',
                    'browserify',
                    'browserify-istanbul',
                    'browserify-shim',
                    'cssify',
                    'deamdify',
                    'gulp-uglify',
                    'html2js-browserify',
                    'jadeify',
                    'vinyl-source-stream',
                    'vinyl-buffer',
                    'watchify'
                ]);
            }

            if(this.release) {
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
                    'node-jsxml',
                    'q',
                    'yargs'
                ]);
            }

            if(this.changelog) {
                this.template('tasks/changelog.js', gulpFolder + '/tasks/changelog.js');
                this.template('common/changelog-script.js', gulpFolder + '/common/changelog-script.js');
                npmPackages = npmPackages.concat([
                    'conventional-changelog',
                    'gulp-exec',
                    'gulp-concat',
                    'gulp-tap',
                    'q',
                    'streamqueue',
                    'yargs'
                ]);
            }
            if(this.test) {
                this.template('tasks/test.js', gulpFolder + '/tasks/test.js');
                npmPackages = npmPackages.concat([
                    'chai',
                    'gulp-mocha',
                    'gulp-istanbul',
                    'gulp-plumber',
                    'gulp-protractor',
                    'gulp-karma',
                    'jasmine-reporters',
                    'jasmine-spec-reporter',
                    'karma',
                    'karma-browserify',
                    'karma-coverage',
                    'karma-growl-reporter',
                    'karma-jasmine',
                    'karma-mocha-reporter',
                    'karma-phantomjs-launcher',
                    'mocha',
                    'mocha-lcov-reporter',
                    'protractor',
                    'protractor-html-screenshot-reporter',
                    'sinon',
                    'yargs'

                ]);
            }

            if(this.style) {
                this.template('tasks/style.js', gulpFolder + '/tasks/style.js');
                npmPackages = npmPackages.concat([
                    'event-stream',
                    'gulp-sass',
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

            if(this.dist) {
                this.template('tasks/dist.js', gulpFolder + '/tasks/dist.js');
                npmPackages = npmPackages.concat([
                    'del',
                    'gulp-rename',
                    'gulp-imagemin'
                ]);
            }
            this.npmPackages = _.uniq(npmPackages);
            done();
        }

    },

    install: function() {

        if(!this.npmPackages) {
            return;
        }
        var that = this;
        var done = this.async();
        var packagesToInstall = _(this.npmPackages)
            .map(function(p) {
                var version = that.npmPackagesVersion[p];
                if(version === undefined) {
                    var err = new Error('Unknown package ' + p);
                    that.emit('error', err);
                }
                if(version.length > 0) {
                    version = '@' + version;
                }
                return p + version;
            }).value();
        this.npmInstall(packagesToInstall, {
            'saveDev': true,
            'saveExact': true
        }, done);
    },

    end: function() {
        this.log('');
        this.log(chalk.green('Woot!') + ' It appears that everything installed correctly.');
        if(this.lint) {
            this.log('Run the command ' + chalk.yellow('gulp lint') + ' to lint your files.');
        }
        if(this.serve) {
            //this.log('Run the command ' + chalk.yellow('gulp serve') + ' to launch a live reload server.');
            this.log('Run the command ' + chalk.yellow('gulp browsersync') + ' to launch a browsersync server.');
        }
        if(this.browserify) {
            this.log('Run the command ' + chalk.yellow('gulp browserify') + ' to create a browserify bundle.');
        }
        if(this.release) {
            this.log('Run the command ' + chalk.yellow('gulp release') + ' to increment version and publish to npm.');
        }
        if(this.changelog) {
            this.log('Run the command ' + chalk.yellow('gulp changelog') + ' to create a CHANGELOG.md file.');
        }
        if(this.test) {
            this.log('Run the command ' + chalk.yellow('gulp test') + ' to run the tests.');
        }
        if(this.dist) {
            this.log('Run the command ' + chalk.yellow('gulp dist') + ' to distribute the application.');
        }
        if(this.style) {
            this.log('Run the command ' + chalk.yellow('gulp style') + ' to compile style files.');
        }
    }

});

module.exports = GulpsGenerator;