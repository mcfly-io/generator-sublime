'use strict';
var gulp = require('gulp');
var esprima = require('esprima');
var debug = require('gulp-debug');
var runSequence = require('run-sequence');
var gtap = require('gulp-tap');
var gulpfile = require('gulp-file');
var graphviz = require('graphviz');
var replace = require('gulp-replace');
var _ = require('lodash');
var constants = require('../common/constants')();

var str = [];
var modules = [];

function createTree(o, parent, grand, index, myfileName) {
    for (var i in o) {
        if (typeof o[i] != 'object') {
            if (i === 'name' && o[i] === 'require') {
                var rep = new RegExp('\.\/(.*)');
                if (rep.test((parent.arguments[0].value))) {
                    var module = rep.exec((parent.arguments[0].value))[1];
                    str.push('\n' + myfileName + ' -> ' + module);
                    modules.push(module);
                }
            }
        }

        if (o[i] !== null && typeof o[i] == 'object') {
            //going on step down in the object tree!!
            createTree(o[i], o, parent, index + 1, myfileName);
        }
    }
}

function createTreeModule(o, parent, grand, index, module) {
    for (var i in o) {
        if (typeof o[i] != 'object') {
            if (i === 'name' && o[i] === 'require') {
                var rep = /\.\.\/(.*)/;
                if (rep.test((parent.arguments[0].value))) {
                    str.push('\n' + module + ' -> ' + rep.exec((parent.arguments[0].value))[1]);
                }
            }
        }
        if (o[i] !== null && typeof o[i] == 'object') {
            //going on step down in the object tree!!
            createTreeModule(o[i], o, parent, index + 1, module);
        }
    }
}

function getModules(module) {

    return gulp.src('./client/scripts/' + module + '/index.js')
        // .pipe(debug({
        //     title: 'unicorn:'
        // }))
        .pipe(gtap(function(file, t) {
            var JsonTree = esprima.parse(file.contents.toString());
            //console.log(JSON.stringify(JsonTree, null, 2));
            var myTree = JSON.parse(JSON.stringify(JsonTree, null, 2));

            createTreeModule(myTree, null, null, 0, module);
            str = _.uniq(str);
        }));
}

gulp.task('target', function() {
    return gulp.src(['./client/**/main-*.js', '!./client/**/*test.js'])
        // .pipe(debug({
        //     title: 'unicorn:'
        // }))
        .pipe(gtap(function(file, t) {
            var JsonTree = esprima.parse(file.contents.toString());
            var myTree = JSON.parse(JSON.stringify(JsonTree, null, 2));

            //-----------Save File Name---------
            var fileName = file.path;
            console.log('----file.path----', file.path);
            var rep = new RegExp('main-(.*)\.js');
            if (rep.test(fileName)) {
                fileName = rep.exec(fileName)[1];
                console.log('----filename----', fileName);
            }
            createTree(myTree, null, null, 0, fileName);
            modules = _.uniq(modules);

        }));
});

gulp.task('module', ['target'], function() {
    for (var i = 0; i < modules.length; i++) {
        getModules(modules[i]);
    }
});

gulp.task('synthesis', ['module'], function() {
    str = _.uniq(str);
    var stringComplet = 'digraph{' + '\n' + 'node [shape=circle color=' + '\"blue\"];' + str + '\n' + '}';
    return gulpfile('test.dot', stringComplet, {
            src: true
        })
        .pipe(replace(/\,/g, ''))
        .pipe(gulp.dest('dist'));
});

gulp.task('parse', ['synthesis'], function(done) {

    graphviz.parse(constants.graph.outputFolder, function(data) {
        var g = data;
        // g.setGraphVizPath('/usr/local/bin');
        g.setGraphVizPath(constants.graph.graphvizbin);
        g.output('png', constants.graph.outputName);
        done();
    }, function(err) {
        console.log('err', err);
        done();
    });

});

gulp.task('graph', function() {
    runSequence('target', 'module', 'synthesis', 'parse');
});

gulp.task('default', ['graph']);
