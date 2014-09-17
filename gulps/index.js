'use strict';
var path = require('path');
var yeoman = require('yeoman-generator');
var exec = require('child_process').exec;
var _ = require('lodash');
var chalk = require('chalk');

var GulpsGenerator = yeoman.generators.Base.extend({

    constructor: function() {
        yeoman.generators.Base.apply(this, arguments);
    },

    initializing: function() {

        this.pkg = require('../package.json');

        var pkgDest = {};
        try {
            pkgDest = this.dest.readJSON('package.json');
        } catch(e) {}

        this.pkgDest = pkgDest;

        this.allTasks = [
            'lint',
            'serve',
            'browserify',
            'release',
            'karma',
            'changelog',
            'test'
        ];
    },
    prompting: {

        askFor: function() {

            var done = this.async();

            var choices = this.allTasks.map(function(task) {
                return {
                    name: task,
                    value: task,
                    checked: false
                };
            });

            var prompts = [{
                type: 'checkbox',
                name: 'Tasks',
                message: 'What gulp tasks do you need ?',
                choices: choices
            }];

            this.prompt(prompts, function(answers) {
                this.Tasks = answers.Tasks = [].concat(answers.Tasks);

                var hasListOption = function(list, option) {
                    return answers[list].indexOf(option) !== -1;
                };

                choices.forEach(function(choice) {
                    this[choice.value] = hasListOption('Tasks', choice.value);
                }.bind(this));

                done();
            }.bind(this));
        }
    },

    writing: {
        projectFiles: function() {
            var done = this.async();
            if(this.Tasks.length <= 0) {
                this.log(chalk.bold.yellow('You didn\'t select any gulp task'));
                done();
                return;
            }

            var npmPackages = [
                'gulp',
                'gulp-util',
                'gulp-load-plugins',
                'require-dir',
                'run-sequence'
            ];

            this.sourceRoot(path.join(__dirname, '../templates/gulps'));

            this.template('gulpfile.js', 'gulpfile.js');
            this.template('common/constants.js', 'gulp/common/constants.js');

            if(this.lint || this.test) {
                this.template('tasks/lint.js', 'gulp/tasks/lint.js');
                npmPackages = npmPackages.concat([
                    'map-stream',
                    'stream-combiner',
                    'chalk',
                    'growly',
                    'lodash',
                    'gulp-jshint',
                    'gulp-jscs',
                    'gulp-eslint',
                    'gulp-plumber'
                ]);
            }
            if(this.serve) {
                this.template('tasks/serve.js', 'gulp/tasks/serve.js');
                npmPackages = npmPackages.concat([
                    'gulp-webserver',
                    'browser-sync',
                    'open'
                ]);
            }
            if(this.browserify) {
                this.template('tasks/browserify.js', 'gulp/tasks/browserify.js');
                npmPackages = npmPackages.concat([
                    'vinyl-source-stream',
                    'browserify',
                    'watchify',
                    'chalk'
                ]);
            }

            if(this.release) {
                this.template('tasks/release.js', 'gulp/tasks/release.js');
                npmPackages = npmPackages.concat([
                    'yargs',
                    'strip-json-comments',
                    'gulp-bump',
                    'gulp-git',
                    'gulp-if'
                ]);
            }

            if(this.karma) {
                this.template('tasks/karma.js', 'gulp/tasks/karma.js');
                npmPackages = npmPackages.concat([
                    'chalk',
                    'gulp-karma'
                ]);
            }

            if(this.changelog) {
                this.template('tasks/changelog.js', 'gulp/tasks/changelog.js');
                npmPackages = npmPackages.concat([
                    'conventional-changelog',
                    'yargs',
                    'marked',
                    'q'
                ]);
            }
            if(this.test) {
                this.template('tasks/test.js', 'gulp/tasks/test.js');
                npmPackages = npmPackages.concat([
                    'gulp-mocha',
                    'gulp-istanbul'
                ]);
            }
            var cmd = 'npm install --save-dev ' + _.uniq(npmPackages).join(' ');
            this.log(chalk.bold.yellow('Please wait while we are running the following command:\n') + cmd);
            this.log(chalk.yellow('...'));

            exec(cmd, function(err) {
                if(err) {
                    this.emit('error', err);
                }
                this.log(chalk.bold.green('npm has executed successfully'));
                done();
            }.bind(this));
        }

    },

    end: function() {
        this.log('');
        this.log(chalk.green('Woot!') + ' It appears that everything installed correctly.');
        if(this.lint) {
            this.log('Run the command ' + chalk.yellow('gulp lint') + ' to lint your files.');

        }
        if(this.serve) {
            this.log('Run the command ' + chalk.yellow('gulp serve') + ' to launch a live reload server.');
            this.log('Run the command ' + chalk.yellow('gulp browsersync') + ' to launch a browsersync server.');

        }
        if(this.browserify) {
            this.log('Run the command ' + chalk.yellow('gulp browserify') + ' to create a browserify bundle.');

        }
        if(this.release) {
            this.log('Run the command ' + chalk.yellow('gulp release') + ' to increment version and publish to npm.');

        }
        if(this.karma) {
            this.log('Run the command ' + chalk.yellow('gulp karma') + ' to run karma.');

        }
        if(this.changelog) {
            this.log('Run the command ' + chalk.yellow('gulp changelog') + ' to create a CHANGELOG.md file.');
        }
        if(this.test) {
            this.log('Run the command ' + chalk.yellow('gulp test') + ' to run the tests.');
        }

    }

});

module.exports = GulpsGenerator;