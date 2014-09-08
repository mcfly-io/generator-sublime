'use strict';

var gulp = require('gulp');
var args = require('yargs').argv;
var $ = require('gulp-load-plugins')();
var spawm = require('child_process').spawn;
var bump = $.bump;
var git = $.git;
var gulpif = $.
if;
var constants = require('../common/constants')();

// TODO: Add build task

/**
 * Bumps any version in the constants.versionFiles
 *
 * USAGE:
 * gulp bump --minor (or --major or --prerelease or --patch which is the default)
 * - or -
 * gulp bump --ver=1.2.3
 * @return {undefined} Nothing
 */
gulp.task('bump', function() {
    var bumpType = 'patch';
    // major.minor.patch
    if(args.patch) {
        bumpType = 'patch';
    }
    if(args.minor) {
        bumpType = 'minor';
    }
    if(args.major) {
        bumpType = 'major';
    }
    if(args.prerelease) {
        bumpType = 'prerelease';
    }
    bumpType = process.env.BUMP || bumpType;

    gulp.src(constants.versionFiles)
        .pipe(gulpif(args.ver !== undefined, bump({
            version: args.ver
        }), bump({
            type: bumpType
        })))
        .pipe(gulp.dest('./'));

});

gulp.task('commit', ['bump'], function() {
    var pkg = require('../../package.json');
    var message = pkg.version;
    gulp.src(constants.versionFiles)
        .pipe(git.add({args: '-A'}))
        .pipe(git.commit(message));
});

gulp.task('tag', ['commit'], function() {
    var pkg = require('../../package.json');
    var v = 'v' + pkg.version;
    var message = pkg.version;
    git.tag(v, message);
});

gulp.task('push', ['tag'], function() {
    git.push('origin', 'master', '--tags');
	git.push('origin', 'master');
});

gulp.task('npm', ['push'], function(done) {
    spawm('npm', ['publish'], {
        stdio: 'inherit'
    }).on('close', done);
});

gulp.task('release', ['npm']);