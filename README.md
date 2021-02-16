# maezato (前里)

> Clone all repositories of a given user at GitHub or Bitbucket,
> by ordering them according to fork/contributing/mine

[![Build Status](https://travis-ci.org/paazmaya/maezato.svg?branch=master)](https://travis-ci.org/paazmaya/maezato)
[![Windows build status](https://ci.appveyor.com/api/projects/status/563ksgaandoqalx1/branch/master?svg=true)](https://ci.appveyor.com/project/paazmaya/maezato/branch/master)
[![codecov.io](https://codecov.io/github/paazmaya/maezato/coverage.svg?branch=master)](https://codecov.io/github/paazmaya/maezato?branch=master)
[![dependencies Status](https://david-dm.org/paazmaya/maezato/status.svg)](https://david-dm.org/paazmaya/maezato)
[![Code Smells](https://sonarcloud.io/api/project_badges/measure?project=paazmaya_maezato&metric=code_smells)](https://sonarcloud.io/dashboard?id=paazmaya_maezato)

![maezato project logo](icon.png)

## Background for the name

The name of this project, `maezato` is a tribute to the late [Mr Shinken Taira](https://en.wikipedia.org/wiki/Taira_Shinken) (平 信賢)
from Kumejima, Okinawa, Japan, who was one of the greatest individuals for preserving
the history of the Ryukyu Martial Arts and thus enabling the students of those arts
to study them today. Without his efforts, it is very likely that several pieces of information
would have been lost for good.

## Installation

Install globally with `npm`, as this tool is a command line tool:

```sh
npm install --global maezato
```

Please note that `git` should be available in the system where this tool is planned to be used.

Please note that the minimum supported version of [Node.js](https://nodejs.org/en/) is `10.13.0`, which is [the active Long Term Support (LTS) version](https://github.com/nodejs/Release#release-schedule).

## Usage

It is possible to use this tool to retrieve all public repositories for a given
user from [Bitbucket](https://bitbucket.org/) or [GitHub](https://github.com/).
Authentication is currently used only for GitHub, while Bitbucket is used via public API interface.

This tool uses [the GitHub API v4](https://developer.github.com/v4/)
and requires [a personal API token](https://github.com/blog/1509-personal-api-tokens)
for authentication.
The token should be set to an environment variable called `GITHUB_TOKEN` or the command line
option named `--token`.

```sh
export GITHUB_TOKEN=123456789123456789123456789123456789
```

Use via command line, always with exactly two arguments and with possible options:

```sh
maezato [options] <username> <target path, defaults to current directory>
```

The cloning of a given repository uses the `ssh_url` property, hence
[the SSH keys should be configured properly](https://help.github.com/articles/generating-ssh-keys/).

Possible command line options are:

```sh
-h, --help              Help and usage instructions
-V, --version           Version number
-v, --verbose           Verbose output, will print which file is currently being processed
-t, --token String      GitHub API personal authentication token
-a, --include-archived  Include also repositories that have been archived
-O, --omit-username     Omit the username directory when creating directory structure
```

For example getting all of the repositories of `@nodejs` under `~/github`:

```sh
maezato nodejs ~/github
```

## Directory structure and git remotes

```sh
<target path>/
    <username>/
        contributing/
            [repositories that are not owned nor forks]
        forks/
            [fork repositories ...]
        mine/
            [repositories which the user owns but are not forks]
```

The fork repositories will have several git remote urls:

* `origin` is the given fork repository
* `upstream` is the repository from which this is a direct fork

There remote urls can be seen with the `git` command:

```sh
git remote -v
```

## Contributing

First thing to do is to file [an issue](https://github.com/paazmaya/maezato/issues).
Then possibly open a Pull Request for solving the given issue.
[ESLint](http://eslint.org/) is used for linting the code and
[tape](https://www.npmjs.com/package/tape) for unit testing.
Please use them by doing:

```sh
npm install
npm run lint
npm test
```

["A Beginner's Guide to Open Source: The Best Advice for Making your First Contribution"](http://www.erikaheidi.com/blog/a-beginners-guide-to-open-source-the-best-advice-for-making-your-first-contribution/).

[Also there is a blog post about "45 Github Issues Dos and Don’ts"](https://davidwalsh.name/45-github-issues-dos-donts).

Linting is done with [ESLint](http://eslint.org) and can be executed with `npm run lint`.
There should be no errors appearing after any JavaScript file changes.

Unit tests are written with [`tape`](https://github.com/substack/tape) and can be executed with `npm test`.
Code coverage is inspected with [`nyc`](https://github.com/istanbuljs/nyc) and
can be executed with `npm run coverage` after running `npm test`.
Please make sure it is over 90% at all times.

## Version history

* `v0.11.0` (2021-02-16)
  - Do not clone an archived repository, unless the option `include-archived` is used
* `v0.10.1` (2021-02-06)
  - GraphQL query had a requirement to always provide next cursor, which caused issues that have now been solved
* `v0.10.0` (2021-02-03)
  - Migrated GitHub API from v3 to v4 and started using GraphQL which reduces the network utilisation #78
  - Forks no longer have the remote called `original`, which contained the `ssh_url` of the ultimate source repository for the fork
  - Need to migrate all but one test execution away from Travis CI due to free account limitations
  - Now using GitHub Actions to execute tests with Node.js v14 and AppVeyor for v12, while Travis CI handles v10
  - Minimum Node.js version lifted from `8.11.1` to `10.13.0`
* `v0.9.2` (2019-06-10)
  - Linting helps to find `undefined` items...
* `v0.9.1` (2019-06-10)
  - Fork data fetching failed due to function refactoring which changed the number of arguments
* `v0.9.0` (2019-06-07)
  - User agent now contains the version of this tool
  - In case an error occurs against the API, show the URL used
* `v0.8.2` (2019-05-27)
  - Started testing against Node.js version 12
  - Using `renovate` to keep dependencies up to date via Pull Requests
  - Minor refaction for clearer code structure and better unit test coverage
* `v0.8.1` (2019-03-05)
  - Takes long to notice crucial bugs, such as not having `lib` folder in the package #17
* `v0.8.0` (2019-01-27)
  - Fixed progress bar not filling to the end due to not counting forks
  - Removed `saveJson` option, since it was initially just for debugging the API payload
  - Use SSH urls for fork remotes #16
* `v0.7.0` (2018-10-05)
  - Option for omitting the username directory from the resulting directory structure #15
  - Include `npm-shrinkwrap.json` in the package to ensure working dependency versions
* `v0.6.0` (2018-08-10)
  - Minimum Node.js version lifted from `4.2.0` to `8.11.1`
  - Default to current working directory when path not defined #14
  - Display progress #12
* `v0.5.3` (2016-08-13)
  - `bin` was not included in the npm package
* `v0.5.2` (2016-08-08)
  - Version info does not print tool name #9
  - Using shared ESLint configuration #8
  - Started testing with Windows at AppVeyor
  - Move code coverage from `instanbul` to `nyc`
* `v0.5.1` (2016-03-12)
  - Wrong properties used
* `v0.5.0` (2016-03-12)
  - Command line code separation so testing can be started
  - Update dependencies plenty
* `v0.4.0` (2015-11-18)
  - Everything with Promises
  - Back to using `got` instead of `gh-got`
* `v0.3.0` (2015-10-29)
  - Command line options #2
* `v0.2.0` (2015-10-26)
  - Using `gh-got` for network connectivity #1
* `v0.1.0` (2015-10-23)
  - Gets the job done, hence first release

## License

Licensed under [the MIT license](LICENSE).

Copyright (c) [Juga Paazmaya](https://paazmaya.fi) <paazmaya@yahoo.com>
