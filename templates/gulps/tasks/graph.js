'use strict';
var gulp = require('gulp');
var esprima = require('esprima');
var graphviz = require('graphviz');
var _ = require('lodash');
var fs = require('fs');
var path = require('path');
var inquirer = require('inquirer');
var constants = require('../common/constants')();

var modules = [];
var g = graphviz.digraph('G');

function createTree(o, parent, grand, index, myfileName) {
    var n1 = g.addNode(myfileName, {
        'color': 'blue',
        'shape': 'circle'
    });

    _.forOwn(o, function(item, key) {
        if (typeof item != 'object') {
            if (key === 'name' && item === 'require') {
                var rep = /\.\/(.*)/;
                if (rep.test(parent.arguments[0].value)) {
                    var module = rep.exec(parent.arguments[0].value)[1];
                    var n2 = g.addNode(module, {
                        'color': 'red',
                        'shape': 'circle'
                    });
                    var e = g.addEdge(n1, n2);
                    e.set('color', 'lightblue');
                    modules.push(module);
                }
            }
        }
        if (item !== null && typeof item == 'object') {
            // going on step down in the object tree
            createTree(item, o, parent, index + 1, myfileName);
        }
    });
}

function createTreeModule(o, parent, grand, index, module) {
    _.forOwn(o, function(item, key) {
        if (typeof item != 'object') {
            if (key === 'name' && item === 'require') {
                var rep = /\.\.\/(.*)/;
                if (rep.test(parent.arguments[0].value)) {
                    var n2 = g.addNode(rep.exec(parent.arguments[0].value)[1], {
                        'color': 'red',
                        'shape': 'circle'
                    });
                    var e = g.addEdge(module, n2);
                    e.set('color', 'lightpink');
                }
            }
        }
        if (item !== null && typeof item == 'object') {
            // going on step down in the object tree
            createTreeModule(item, o, parent, index + 1, module);
        }
    });
}

var selectTargets = function(targets) {
    return _.filter(targets, function(file) {
        var rep = new RegExp('main(.*)\.js');
        return rep.test(file) && file.indexOf('test') <= 0;
    });
};

gulp.task('graph', 'Generate a dependency graph', function(done) {
    var folderScript = './' + constants.clientFolder + '/scripts';
    var files = fs.readdirSync(folderScript);
    var targets = selectTargets(files);

    var choices = targets.map(function(target) {
        return {
            name: target,
            value: target,
            checked: true
        };
    });
    var prompts = [{
        type: 'checkbox',
        name: 'Targets',
        message: 'Which targets should be part of the dependency graph ?',
        choices: choices
    }];

    inquirer.prompt(prompts, function(answers) {
        targets = answers.Targets = [].concat(answers.Targets);

        _.forEach(targets, function(target) {
            var filename = path.join(folderScript, target);
            var content = fs.readFileSync(filename);
            var JsonTree = esprima.parse(content.toString());
            //var myTree = JSON.parse(JSON.stringify(JsonTree, null, 2));
            createTree(JsonTree, null, null, 0, target.replace('.js', ''));
            modules = _.uniq(modules);

        });
        _.forEach(modules, function(module) {
            try {
                var filename = './' + constants.clientFolder + '/scripts/' + module + '/index.js';
                var content = fs.readFileSync(filename);
                var JsonTree = esprima.parse(content.toString());
                //var myTree = JSON.parse(JSON.stringify(JsonTree, null, 2));
                createTreeModule(JsonTree, null, null, 0, module);
            } catch (err) {}
        });

        g.output('png', constants.graph.outputName);
        done();
    });

});
