# Sublime Generator 
[![NPM version](https://badge.fury.io/js/generator-sublime.svg)](http://badge.fury.io/js/generator-sublime) [![Build Status](https://travis-ci.org/thaiat/generator-sublime.svg?branch=master)](https://travis-ci.org/thaiat/generator-sublime) [![Dependency Status](https://david-dm.org/thaiat/generator-sublime.png)](https://david-dm.org/thaiat/generator-sublime) [![devDependency Status](https://david-dm.org/thaiat/generator-sublime/dev-status.png)](https://david-dm.org/thaiat/generator-sublime#info=devDependencies)

> Yeoman generator for scaffolding the standard configuration root files like .gitignore, .jshintrc, .jscsrc etc...

[![NPM](https://nodei.co/npm/generator-sublime.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/generator-sublime/)

## Usage

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

## Options
You can use the `--hideWelcome` option to hide the welcome message. 
This is usefull when you compose this generator with your own so you don't get twice welcome messages.

## Results
This generator will scaffold the following files:
* .jshintrc
* .jscsrc
* .tern-project
* .jsbeautifyrc
* .gitignore

## License

MIT
