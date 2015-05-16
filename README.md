# Sublime Generator 
[![NPM version](https://badge.fury.io/js/generator-sublime.svg)](http://badge.fury.io/js/generator-sublime) [![Downloads](http://img.shields.io/npm/dm/generator-sublime.svg)](http://badge.fury.io/js/generator-sublime)   
[![Build Status](https://travis-ci.org/thaiat/generator-sublime.svg?branch=master)](https://travis-ci.org/thaiat/generator-sublime) [![Test Coverage](https://codeclimate.com/github/thaiat/generator-sublime/badges/coverage.svg)](https://codeclimate.com/github/thaiat/generator-sublime) [![Code Climate](https://codeclimate.com/github/thaiat/generator-sublime/badges/gpa.svg)](https://codeclimate.com/github/thaiat/generator-sublime)   
[![Dependency Status](https://david-dm.org/thaiat/generator-sublime.svg)](https://david-dm.org/thaiat/generator-sublime) [![devDependency Status](https://david-dm.org/thaiat/generator-sublime/dev-status.svg)](https://david-dm.org/thaiat/generator-sublime#info=devDependencies) [![peerDependency Status](https://david-dm.org/thaiat/generator-sublime/peer-status.svg)](https://david-dm.org/thaiat/generator-sublime#info=peerDependencies)    


> Yeoman generator for scaffolding the standard configuration root files like .gitignore, .jshintrc, .jscsrc etc...

[![NPM](https://nodei.co/npm/generator-sublime.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/generator-sublime)

## Usage

This generator-sublime is mainly used as a sub generator of [generator-angular-famous-ionic](https://github.com/thaiat/generator-angular-famous-ionic)

### sublime:app
Install `generator-sublime`:
```
npm install -g generator-sublime
```

Make a new directory, and `cd` into it:
```
mkdir my-new-project && cd $_
```

Run `yo sublime`:
```
yo sublime
```

#### Options
You can use the `--skip-welcome-message` option to hide the welcome message. 
This is usefull when you compose this generator with your own so you don't get twice welcome messages.

You can use the `--nodeVersion` option to set the version of node.js for continuous delivery.

You can use the `--githubUser` option to pass your github username. It is usefull when scaffolding .travis.yml so that travis knows how to publish your npm package
```bash
yo sublime --githubUser=toto
```

You can use the `--checkTravis` option to by pass checking if travis cli is installed.

#### Results
This generator will scaffold the following files:
* .jshintrc
* .jscsrc
* .eslintrc
* .tern-project
* .jsbeautifyrc
* .gitignore
* readme.md (comes with badges!)
* startup.sh (codio startup file)
* bin/git-config.sh (configure git with common aliases and options)
* .travis.yml (travis-ci config file)
* shippable.yml (shippable.com config file)
* .settings (codio settings file)

In addition `generator-sublime` will configure `.travis.yml` file for npm publishing your package if the build succeeds.


### sublime:bash
```
yo sublime:bash ./path/to/your/bashfile.sh
```

#### Results
This will scaffold a basic bash file with correct header and chmod options.
You should then be able to run it
```
./path/to/your/bashfile.sh
```

### sublime:gulps
```
yo sublime:gulps
```
#### Options
* clientFolder : the name of the client folder (usually `client` or `www`)
* ionic : true to include ionic framework
* famous : true to include angular-famous framework
* fontawesome : true to include font-awesome
* bootstrap : true to include the bootstrap library

To better understand the gulp task system have a look at the docs of [`gulp-mux`](https://github.com/thaiat/gulp-mux).

#### Results
This will scaffold some common gulp tasks:
* browserify (create a browserify bundle)
* changelog (create a CHANGELOG.md file when your commit messages adhere to angular commit guidelines)
* lint (linting through jshint, jscs, and eslint)
* release (bump the version, create tag and publish to github)
* serve (start a server using livereload)
* browsersync (start a server using browserSync)
* test (run unit tests - support karma and mocha)
* style (create a bundle css file)

## Testing

Running `npm test` will run the unit tests with mocha.

## Changelog

Recent changes can be viewed on Github on the [Releases Page](https://github.com/thaiat/generator-sublime/releases)

## License

BSD
