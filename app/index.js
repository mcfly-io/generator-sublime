'use strict';
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
var _ = require('lodash');
//var chalk = require('chalk');

var SublimeGenerator = yeoman.generators.Base.extend({

    constructor: function() {
        yeoman.generators.Base.apply(this, arguments);

        this.option('hideWelcome', {
            desc: 'Hide the welcome message',
            type: 'Boolean',
            defaults: false
        });

    },

    init: function() {
        this.pkg = require('../package.json');
        this.allFiles = [
            '.jshintrc',
            '.jscsrc',
            '.tern-project',
            '.jsbeautifyrc',
            '.gitignore'
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
                value: file.replace('.', '').replace('-', ''),
                checked: true
            };
        }.bind(this));

        var prompts = [{
            type: 'checkbox',
            name: 'files',
            message: 'What files do you need ?',
            choices: choices

        }, {
            type: 'input',
            name: 'indent',
            message: 'What indentation value would you like ?',
            when: function(answers) {
                return _.contains(answers.files, 'jshintrc') || _.contains(answers.files, 'jsbeautifyrc' || _.contains(answers.files, 'jscsrc'));
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
        }];

        this.prompt(prompts, function(answers) {

            var hasListOption = function(list, option) {
                return answers[list].indexOf(option) !== -1;
            };

            choices.forEach(function(choice) {
                this[choice.value] = hasListOption('files', choice.value);
            }.bind(this));

            this.indent = answers.indent;

            done();
        }.bind(this));
    },

    projectFiles: function() {

        this.sourceRoot(path.join(__dirname, '../templates/root'));

        if(this.jshintrc) {
            this.copy('_jshintrc', '.jshintrc');
        }
        if(this.jscsrc) {
            this.copy('_jscsrc', '.jscsrc');
        }
        if(this.ternproject) {
            this.copy('_tern-project', '.tern-project');
        }
        if(this.jsbeautifyrc) {
            this.copy('_jsbeautifyrc', '.jsbeautifyrc');
        }
        if(this.gitignore) {
            this.copy('_gitignore', '.gitignore');
        }
    }
});

module.exports = SublimeGenerator;