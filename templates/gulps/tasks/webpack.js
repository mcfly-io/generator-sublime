'use strict';
var gulp = require('gulp');
var gutil = require('gulp-util');
var gmux = require('gulp-mux');
var helper = require('../common/helper');
var constants = require('../common/constants')();
var webpack = require('webpack');
var transform = require('vinyl-transform');
var gulpif = require('gulp-if');
var mkdirp = require('mkdirp');
var _ = require('lodash');
var path = require('path');
var exorcist = require('exorcist');
var webpackConfig = require(path.join(__dirname, '../../webpack.config.js'));

var webpackShare = function(shouldWatch, constants, done) {
    var version = helper.readJsonFile('./package.json').version;
    var dest = constants.dist.distFolder;
    dest = helper.isMobile(constants) ? dest + '/www/' + constants.script.dest : dest + '/' + constants.script.dest;
    var mode = constants.mode;
    var target = constants.targetName;
    var bundleName = constants.bundleName || 'bundle.js';
    var releaseName = target + '-v' + version;
    var sourceMap = releaseName + constants.exorcist.mapExtension;

    //webpackConfig.entry = ['babel/polyfill', constants.webpack.src];
    webpackConfig.entry = constants.webpack.src;
    webpackConfig.output.path = dest;
    webpackConfig.output.filename = bundleName;
    webpackConfig.output.sourceMapFilename = sourceMap;
    webpackConfig.debug = mode === 'prod' ? false : true;
    webpackConfig.output.pathinfo = mode === 'prod' ? false : true;
    webpackConfig.devtool = mode === 'prod' ? 'inline-source-map' : 'cheap-module-eval-source-map';

    var webpackHandler = function(err, stats) {
        var rootUrl = '';
        var basePath = path.join(constants.clientFolder, constants.script.dest);

        gulp.src(dest + '/' + bundleName)
            .pipe(gulpif(mode === 'prod', transform(function() {
                // in prod mode we save the source map file in a special folder
                // we first need to make sure the destination folder exists
                mkdirp.sync(constants.exorcist.dest);
                var normalizedURL = helper.resolveSentryNormalizedUrl(constants);
                if (normalizedURL.length > 0) {
                    var sourceMapURL = normalizedURL + '/' + sourceMap;
                    return exorcist(path.join(constants.exorcist.dest, sourceMap), sourceMapURL, rootUrl, constants.clientFolder);
                } else {
                    // when no normalizedURL we copy the source map along with the bundle
                    return exorcist(path.join(dest, sourceMap), sourceMap, rootUrl, basePath);
                }
            }), gutil.noop()))
            .pipe(gulp.dest(dest))
            .on('end', function() {
                if (done) {
                    done();
                }
            });

        if (err) {
            gutil.beep();
            gutil.log(gutil.colors.red('Webpack failed'));
            gutil.log(gutil.colors.red(err));
        }
        var info = stats.toString({
            colors: true,
            hash: false,
            modulesSort: 'name'
        }).split('/~/').join('/node_modules/'); // replaceAll
        if (global.webpackQuiet !== true) {
            gutil.log(info);
        }
        if (stats.hasErrors() || stats.hasWarnings()) {
            gutil.beep();
        }
    };

    var envifyVars = helper.getEnvifyVars(constants);

    if (mode === 'prod') {
        webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin({
            comments: false,
            compress: {
                warnings: false
            }
        }));
    }
    if (require('yargs').argv.coverage) {
        webpackConfig.cache = true;
        webpackConfig.devtool = 'eval'; //'inline-source-map';
        webpackConfig.module.preLoaders = webpackConfig.module.preLoaders || [];
        webpackConfig.module.preLoaders.push({
            test: /\.js$/,
            exclude: /\.webpack\.js|node_modules|bower_components|\.test\.js/,
            loader: 'istanbul-instrumenter'
        });
    }
    // webpackConfig.plugins.push(new webpack.DefinePlugin({
    //     'process.env': Object.keys(envifyVars).reduce(function(o, k) {
    //         o[k] = JSON.stringify(envifyVars[k]);
    //         console.log(o);
    //         return o;
    //     }, {})
    // }));

    _.extend(process.env, envifyVars);

    var compiler = webpack(webpackConfig);

    if (shouldWatch) {
        compiler.watch({
            aggregateTimeout: 300 // wait so long for more changes
        }, webpackHandler);
    } else {
        compiler.run(webpackHandler);
    }
};

var taskWebpackRun = function(constants, done) {
    webpackShare(false, constants, done);
};

var taskWebpackWatch = function(constants) {
    webpackShare(true, constants);
};

gulp.task('webpack:run', 'Generates a bundle javascript file with webpack run.', function(done) {
    var taskname = 'webpack:run';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForMultipleTargets(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskWebpackRun, taskname, global.options.target, global.options.mode, constants, done);

});

gulp.task('webpack:watch', 'Generates a bundle javascript file with webpack watch.', function() {
    var taskname = 'webpack:watch';
    gmux.targets.setClientFolder(constants.clientFolder);
    if (global.options === null) {
        global.options = gmux.targets.askForSingleTarget(taskname);
    }
    return gmux.createAndRunTasks(gulp, taskWebpackWatch, taskname, global.options.target, global.options.mode, constants);

});
