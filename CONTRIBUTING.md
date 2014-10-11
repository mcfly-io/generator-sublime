Contribution Guide
===================

This document describes some points about contribution process for this project.
The project is being developed within community. Maintainer merges pull-requests, fixes critical bugs.

The maintainers of the project are:
- [Avi Haiat](http://github.com/thaiat)

## General notes

- In lieu of a formal styleguide, take care to maintain the existing coding style 
- Add unit tests for any new or changed functionality.
- Lint and test your code using [gulp test](http://gulpjs.com/).

And please:

### Always run `npm test` before sending a PR
> This will run `gulp lint`, and then `gulp mocha` (the same as `gulp test`)

## Sending Pull-Requests

If you fixed or added something useful to the project, you can send pull-request. It will be reviewed by maintainer and accepted, or commented for rework, or declined. If you a new and don't know what you should do to send a PR, please see [this tutorial](https://gist.github.com/luanmuniz/da0b8d2152c4877f93c4)

Before sending you Pull Request please don't forget to check your code with `npm test`. PR that don't pass tests will not be accept

## Git Commit Guidelines

These rules are adopted from the AngularJS project.

### Commit Message Format
Each commit message consists of a **header**, a **body** and a **footer**.  The header has a special
format that includes a **type**, a **scope** and a **subject**:

```
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

Any line of the commit message cannot be longer 100 characters! This allows the message to be easier
to read on github as well as in various git tools.

### Type
Must be one of the following:

* **feat**: A new feature
* **fix**: A bug fix
* **docs**: Documentation only changes
* **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing
  semi-colons, etc)
* **refactor**: A code change that neither fixes a bug or adds a feature
* **test**: Adding missing tests
* **chore**: Changes to the build process or auxiliary tools and libraries such as documentation
  generation

### Scope
The scope could be anything specifying place of the commit change. For example `app`,
`gen`, `docs`, `gen:view`, `gen:route`, `gen:service`, etc...

### Subject
The subject contains succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize first letter
* no dot (.) at the end

###Body
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes"
The body should include the motivation for the change and contrast this with previous behavior.

###Footer
The footer should contain any information about **Breaking Changes** and is also the place to
reference GitHub issues that this commit **Closes**.

A detailed explanation can be found in this [document][commit-message-format].

[commit-message-format]: https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y