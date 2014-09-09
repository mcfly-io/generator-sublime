'use strict';
var path = require('path');
var chalk = require('chalk');
var yeoman = require('yeoman-generator');

var BashGenerator = yeoman.generators.Base.extend({

    constructor: function() {
        yeoman.generators.Base.apply(this, arguments);
        this.argument('name', {
            type: String,
            required: true
        });
    },

    writing: {
        generateBash: function() {
            this.sourceRoot(path.join(__dirname, '../templates/bash'));
            this.copy('bash.sh', this.name);
        }

    },

    end: function() {
        this.log('');
        this.log(chalk.green('Woot!') + ' the file ' + this.name + ' was created successfully.');

    }

});

module.exports = BashGenerator;