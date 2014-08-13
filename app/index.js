'use strict';
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');
//var chalk = require('chalk');

var SublimeGenerator = yeoman.generators.Base.extend({
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
        this.log(yosay('Welcome to the marvelous Sublime generator!'));

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
            message: 'Choose the configuration files you need',
            choices: choices

        }];

        this.prompt(prompts, function(answers) {
            
            var hasListOption = function(list, option) {
                return answers[list].indexOf(option) !== -1;
            };

            choices.forEach(function(choice) {
                this[choice.value] = hasListOption('files', choice.value);
            }.bind(this));

            done();
        }.bind(this));
    },

    projectFiles: function() {

        this.sourceRoot(path.join(__dirname, '../templates'));

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