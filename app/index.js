'use strict';
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var _ = require('lodash');
var chalk = require('chalk');
var GitHubApi = require('github');
var updateNotifier = require('update-notifier');
var exec = require('child_process').exec;
var npm = require('npm');
var shell = require('shelljs');

var githubOptions = {
    version: '3.0.0'
};

var travisOptions = {
    version: '1.7.1'
};

var github = new GitHubApi(githubOptions);

var githubUserInfo = function(name, cb) {
    github.user.getFrom({
        user: name
    }, function(err, res) {

        if(err) {
            throw new Error('Cannot fetch your github profile. Make sure you\'ve typed it correctly.');
        }
        cb(JSON.parse(JSON.stringify(res)));
    });
};

var SublimeGenerator = yeoman.generators.Base.extend({

    constructor: function() {
        yeoman.generators.Base.apply(this, arguments);
        this.option('hideWelcome', {
            desc: 'Hide the welcome message',
            type: 'Boolean',
            defaults: false
        });

        this.option('nodeVersion', {
            desc: 'Node.js version',
            type: 'String',
            defaults: '0.10.30'
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
        var notifier = updateNotifier({
            packageName: this.pkg.name,
            packageVersion: this.pkg.version,
            updateCheckInterval: 1
        });

        if(notifier.update) {
            if(notifier.update.latest !== this.pkg.version) {
                notifier.notify();
                shell.exit(1);
            }
        }
        var pkgDest = {};
        try {
            pkgDest = this.dest.readJSON('package.json');
        } catch(e) {}

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
            'readme.md'
        ];
    },

    prompting: {
        welcome: function() {
            // Have Yeoman greet the user.
            if(!this.options.hideWelcome) {
                this.log(yosay('Welcome to the marvelous Sublime generator!'));
            }

            // check if travis is installed
            if(this.options.checkTravis) {
                if(!this.shell.which('travis')) {
                    this.log(chalk.red.bold('\nCould not find travis cli... ' +
                        '\nPlease install it manually using the following command : '
                    ) + chalk.yellow.bold('\ngem install travis -v' + this.travisOptions.version + ' --no-rdoc --no-ri'));
                    this.shell.exit(1);
                } else {
                    this.log(chalk.gray('travis is installed, continuing...\n'));
                }
            }
        },
        askFor: function() {

            var done = this.async();

            var choices = this.allFiles.map(function(file) {
                return {
                    name: file,
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
                    return _.contains(values, 'Jshintrc') || _.contains(values, 'Jsbeautifyrc' || _.contains(values, 'Jscsrc'));
                },
                validate: function(input) {
                    var value = parseInt(input, 10);
                    var isValid = value !== undefined && value >= 0 && value <= 10;
                    if(!isValid) {
                        return 'You must choose an integer value between 0 and 10';
                    }

                    return true;
                },
                default: 4
            }, {
                type: 'confirm',
                name: 'NpmPublish',
                message: 'Would you like travis to publish your package on npm ?',
                default: true,
                when: function(answers) {
                    var values = answers.Files;
                    return _.contains(values, 'TravisYml');
                }
            }, {
                type: 'confirm',
                name: 'CodioStartup',
                message: 'Do you need a codio startup.sh file ?',
                default: true
            }, {
                type: 'confirm',
                name: 'Gitconfig',
                message: 'Do you need a git-config.sh file ?',
                default: true
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
                    if(!isValid) {
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
                if(this.githubUser === undefined) {
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

    configuring: {
        npmLogin: function() {
            if(this.NpmPublish) {
                var that = this;
                var done = this.async();

                that.log(chalk.yellow.bold('\n' + 'npm login : ') + chalk.gray('Enter your npm credentials...'));

                // npm login, this creates the file '~/.npmrc'
                // we cannot use here spawn as it does not work on windows platform
                // we have to require npm
                npm.load(function(err, npm) {
                    if(err) {
                        throw err;
                    }

                    npm.login(function() {
                        var cmdTextEmail = 'cat ~/.npmrc | grep \'email\'';
                        // parse '~/.npmrc' to retreive npm email
                        exec(cmdTextEmail, function(err, stdout) {
                            if(err) {
                                throw new Error(err);
                            }
                            that.email = stdout.split('=')[1];
                            done();
                        });
                    });

                });
            }
        }
    },

    writing: {
        projectFiles: function() {

            this.sourceRoot(path.join(__dirname, '../templates/root'));

            if(this.Jshintrc) {
                this.template('_jshintrc', '.jshintrc');
            }
            if(this.Jscsrc) {
                this.template('_jscsrc', '.jscsrc');
            }
            if(this.Eslintrc) {
                this.template('_eslintrc', '.eslintrc');
            }
            if(this.TernProject) {
                this.template('_tern-project', '.tern-project');
            }
            if(this.Jsbeautifyrc) {
                this.template('_jsbeautifyrc', '.jsbeautifyrc');
            }
            if(this.Gitignore) {
                this.template('_gitignore', '.gitignore');
            }
            if(this.CodioStartup) {
                this.template('startup.sh', 'startup.sh');
            }
            if(this.ShippableYml) {
                this.template('shippable.yml', 'shippable.yml');
            }
            if(this.TravisYml) {
                this.template('_travis.yml', '.travis.yml');
            }
            if(this.Gitconfig) {
                this.template('bin/git-config.sh', 'bin/git-config.sh');
            }
            if(this.ReadmeMd) {
                this.template('_README.md', 'readme.md');
            }
        },

        npmPublish: function() {
            if(this.NpmPublish) {

                var that = this;
                var done = this.async();

                var cmdTextApiKey = 'cat ~/.npmrc | grep \'_auth\'';

                exec(cmdTextApiKey, function(err, stdout) {

                    if(err) {
                        that._errorTravis.call(that, err);
                    }
                    var auth = stdout.split('=')[1];
                    exec('travis encrypt ' + auth + ' --add deploy.api_key -r ' + that.githubUser + '/' + that.appnameFolder, function(err) {
                        if(err) {
                            that._errorTravis.call(that, err);
                        }
                    });
                    done();
                });

            }
        }
    },

    _errorTravis: function(err) {
        this.log(chalk.red('The following error occured configuring travis for npm publish :'));
        this.log(chalk.red('\n' + err.message));
        this.log(chalk.yellow.bold('\nYou need to configure manually .travis.yml deploy section'));
    }

});

module.exports = SublimeGenerator;