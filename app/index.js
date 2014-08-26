'use strict';
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var _ = require('lodash');
var chalk = require('chalk');
var GitHubApi = require('github');

var exec = require('child_process').exec;
var npm = require('npm');

var githubOptions = {
    version: '3.0.0'
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

        this.appnameFolder = _.slugify(this.appname);
    },

    init: function() {

        this.pkg = require('../package.json');

        this.allFiles = [
            '.jshintrc',
            '.jscsrc',
            '.tern-project',
            '.jsbeautifyrc',
            '.gitignore',
            '.travis.yml',
            'shippable.yml'
        ];
    },

    welcome: function() {
        // Have Yeoman greet the user.
        if(!this.options.hideWelcome) {
            this.log(yosay('Welcome to the marvelous Sublime generator!'));
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

            githubUserInfo(this.githubUser, function(res) {

                this.realname = res.name;
                this.email = res.email;
                this.githubUrl = res.html_url;
                done();
            }.bind(this));

        }.bind(this));
    },

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
                    var cmdTextEmail = 'cat ~/.npmrc | grep \'email\' | awk -F \'=\' \'{print $2}\'';
                    // parse '~/.npmrc' to retreive npm email
                    exec(cmdTextEmail, function(err, stdout) {
                        that.email = stdout;
                        done();
                    });
                });

            });

            //             var cmd = spawn('npm', ['login'], {
            //                 cwd: __dirname,
            //                 stdio: 'inherit'
            //             });

            //             cmd.on('exit', function() {

            //                 // parse '~/.npmrc' to retreive npm email
            //                 exec(cmdTextEmail, function(err, stdout) {
            //                     that.email = stdout;
            //                     done();
            //                 });
            //             });

        }
    },

    projectFiles: function() {

        this.sourceRoot(path.join(__dirname, '../templates/root'));

        if(this.Jshintrc) {
            this.copy('_jshintrc', '.jshintrc');
        }
        if(this.Jscsrc) {
            this.copy('_jscsrc', '.jscsrc');
        }
        if(this.TernProject) {
            this.copy('_tern-project', '.tern-project');
        }
        if(this.Jsbeautifyrc) {
            this.copy('_jsbeautifyrc', '.jsbeautifyrc');
        }
        if(this.Gitignore) {
            this.copy('_gitignore', '.gitignore');
        }
        if(this.CodioStartup) {
            this.copy('startup.sh', 'startup.sh');
        }
        if(this.ShippableYml) {
            this.copy('shippable.yml', 'shippable.yml');
        }
        if(this.TravisYml) {
            this.copy('_travis.yml', '.travis.yml');

        }
        if(this.Gitconfig) {
            this.copy('deploy/git-config.sh', 'deploy/git-config.sh');
        }
    },

    npmPublish: function() {
        if(this.NpmPublish) {

            var that = this;
            var done = this.async();
            this.appnameFolder = 'generator-sublime';
            var cmdTextApiKey = 'cat ~/.npmrc | grep \'_auth\' | awk -F \'=\' \'{print $2}\' | travis encrypt --add deploy.api_key -r ' + that.githubUser + '/' + that.appnameFolder;

            exec(cmdTextApiKey, function(err) {
                if(err) {

                    that.log(chalk.red('The following error occured configuring travis for npm publish :'));
                    that.log(chalk.red('\n' + err.message));
                    that.log(chalk.yellow.bold('\nYou need to configure manually .travis.yml deploy section'));
                }

                done();
            });

        }
    }

});

module.exports = SublimeGenerator;