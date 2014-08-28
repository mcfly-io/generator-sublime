'use strict';
var path = require('path');
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

    }

});

module.exports = BashGenerator;