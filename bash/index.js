'use strict';
var path = require('path');
var yeoman = require('yeoman-generator');

var BashGenerator = yeoman.generators.NamedBase.extend({

    constructor: function() {
        yeoman.generators.NamedBase.apply(this, arguments);
    },

    generateBash: function() {
        this.sourceRoot(path.join(__dirname, '../templates/bash'));

        this.copy('bash.sh', this.name);
    }

});

module.exports = BashGenerator;