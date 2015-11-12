'use strict';
var path = require('path');
var chalk = require('chalk');
var generators = require('yeoman-generator');

var BashGenerator = generators.Base.extend({

    constructor: function() {
        generators.Base.apply(this, arguments);
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
        this.log(chalk.green('Woot generator-sublime:bash!') + ' the file ' + this.name + ' was created successfully.');

    }

});

module.exports = BashGenerator;