'use strict';
var path = require('path');
var yosay = require('yosay');
var _ = require('lodash');
var chalk = require('chalk');
var GitHubApi = require('github');
var Class = require('../class');

var githubOptions = {
    version: '3.0.0'
};

var travisOptions = {
    version: '1.7.4'
};

var github = new GitHubApi(githubOptions);

var githubUserInfo = function(name, cb) {
    github.user.getFrom({
        user: name
    }, function(err, res) {

        if (err) {
            throw new Error('Cannot fetch your github profile. Make sure you\'ve typed it correctly.');
        }
        cb(JSON.parse(JSON.stringify(res)));
    });
};

var SublimeGenerator = Class.extend({

    constructor: function() {
        Class.apply(this, arguments);
        this.option('skip-welcome-message', {
            desc: 'Hide the welcome message',
            type: 'Boolean',
            defaults: false
        });

        this.option('nodeVersion', {
            desc: 'Node.js version',
            type: 'String',
            defaults: '0.12.4'
        });

        this.option('githubUser', {
            desc: 'Your github username',
            type: 'String'
        });

        this.option('checkTravis', {
            desc: 'Check if travis cli is installed',
            type: 'Boolean',
            defaults: true
        });

        this.appnameFolder = _.slugify(this.appname);
        this.travisOptions = travisOptions;
    },

    initializing: function() {

        this.pkg = require('../package.json');
        this.notifyUpdate(this.pkg);

        var pkgDest = {};
        try {
            pkgDest = this.dest.readJSON('package.json');
        } catch (e) {}

        this.pkgDest = pkgDest;

        this.allFiles = [
            '.jshintrc',
            '.jscsrc',
            '.eslintrc',
            '.tern-project',
            '.jsbeautifyrc',
            '.gitignore',
            '.travis.yml',
            'shippable.yml',
            'readme.md',
            '.settings'
        ];
    },

    prompting: {
        welcome: function() {
            // Have Yeoman greet the user.
            if (!this.options['skip-welcome-message']) {
                this.log(yosay('Welcome to the marvelous Sublime generator!'));
            }
        },

        askFor: function() {

            var done = this.async();

            var choices = this.allFiles.map(function(file) {
                return {
                    name: file === '.settings' ? '.settings (codio)' : file,
                    value: this._.classify(file),
                    checked: true
                };
            }.bind(this));

            var prompts = [{
                type: 'checkbox',
                name: 'Files',
                message: 'What files do you need ?',
                choices: choices

            }, {
                type: 'input',
                name: 'Indent',
                message: 'What indentation value would you like ?',
                when: function(answers) {
                    var values = answers.Files;
                    return _.contains(values, 'Jshintrc') || _.contains(values, 'Jsbeautifyrc') || _.contains(values, 'Jscsrc') || _.contains(values, 'Settings');
                },
                validate: function(input) {
                    var value = parseInt(input, 10);
                    var isValid = value !== undefined && value >= 0 && value <= 10;
                    if (!isValid) {
                        return 'You must choose an integer value between 0 and 10';
                    }

                    return true;
                },
                default: 4
            }, {
                type: 'confirm',
                name: 'NpmPublish',
                message: 'Would you like travis to publish your package on npm ?',
                default: false,
                when: function(answers) {
                    var values = answers.Files;
                    return _.contains(values, 'TravisYml');
                }
            }, {
                type: 'confirm',
                name: 'CodioStartup',
                message: 'Do you need a codio startup.sh file ?',
                default: false
            }, {
                type: 'confirm',
                name: 'Gitconfig',
                message: 'Do you need a git-config.sh file ?',
                default: false
            }];

            this.prompt(prompts, function(answers) {
                answers.Files = [].concat(answers.Files);

                var hasListOption = function(list, option) {
                    return answers[list].indexOf(option) !== -1;
                };

                choices.forEach(function(choice) {
                    this[choice.value] = hasListOption('Files', choice.value);
                }.bind(this));

                this.Indent = answers.Indent;
                this.CodioStartup = answers.CodioStartup;
                this.Gitconfig = answers.Gitconfig;
                this.NpmPublish = answers.NpmPublish;

                done();
                // check if travis is installed
                //if(this.options.checkTravis && this.NpmPublish) {
                //    this.checkTravis().then(function() {
                //        done();
                //    });
                //} else {
                //    done();
                //}

            }.bind(this));
        },

        askForGithub: function() {
            var done = this.async();
            var that = this;
            var prompts = [{
                name: 'githubUser',
                message: 'What is your username on GitHub ?',
                validate: function(input) {
                    var value = input;
                    var isValid = value !== undefined && value.length > 0;
                    if (!isValid) {
                        return 'You must provide a valid login';
                    }
                    return true;
                },
                when: function() {
                    return !that.options.githubUser && that.NpmPublish;
                }
            }];

            this.prompt(prompts, function(answers) {

                this.githubUser = this.options.githubUser || answers.githubUser;
                if (this.githubUser === undefined) {
                    done();
                    return;
                }
                githubUserInfo(this.githubUser, function(res) {
                    this.realname = res.name;
                    this.email = res.email;
                    this.githubUrl = res.html_url;
                    done();
                }.bind(this));

            }.bind(this));
        }
    },

    writing: {
        projectFiles: function() {

            this.sourceRoot(path.join(__dirname, '../templates/app'));

            if (this.Jshintrc) {
                this.template('_jshintrc', '.jshintrc');
            }
            if (this.Jscsrc) {
                this.template('_jscsrc', '.jscsrc');
            }
            if (this.Eslintrc) {
                this.template('_eslintrc', '.eslintrc');
                this.template('_eslintignore', '.eslintignore');
            }
            if (this.TernProject) {
                this.template('_tern-project', '.tern-project');
            }
            if (this.Jsbeautifyrc) {
                this.template('_jsbeautifyrc', '.jsbeautifyrc');
            }
            if (this.Gitignore) {
                this.template('_gitignore', '.gitignore');
            }
            if (this.CodioStartup) {
                this.template('startup.sh', 'startup.sh');
            }
            if (this.ShippableYml) {
                this.template('shippable.yml', 'shippable.yml');
            }
            if (this.TravisYml) {
                var nodeVersion = this.options.nodeVersion;
                this.shortNodeVersion = _.first(nodeVersion.split('.'), 2).join('.');
                this.template('_travis.yml', '.travis.yml');
                this.template('_codeclimate.yml', '.codeclimate.yml');
            }
            if (this.Gitconfig) {
                this.template('bin/git-config.sh', 'bin/git-config.sh');
                this.template('bin/validate-commit-msg.js', 'bin/validate-commit-msg.js');
            }
            if (this.ReadmeMd) {
                this.template('_README.md', 'readme.md');
            }
            if (this.Settings) {
                this.template('_settings', '.settings');
                this.template('_codio', '.codio');
            }
        }
    },

    end: function() {
        this.log('');
        this.log(chalk.green('Woot!') + ' It appears that everything installed correctly.');
        this.log('Run the command ' + chalk.yellow('yo sublime:bash path/to/bashfile.sh') + ' to create a new bash file.');
        this.log('Run the command ' + chalk.yellow('yo sublime:gulps') + ' to scaffold gulp tasks.');
    }

});

module.exports = SublimeGenerator;