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

[Changes happening across different versions and upcoming changes are tracked in the `CHANGELOG.md` file.](CHANGELOG.md)

## License

Licensed under [the MIT license](LICENSE).

Copyright (c) [Juga Paazmaya](https://paazmaya.fi) <paazmaya@yahoo.com>
