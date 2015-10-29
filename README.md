# maezato

> Clone all repositories of a given user at GitHub,
> by ordering them according to fork/contributing/mine

## Installation

Install globally with `npm`, as this tool is a command line tool:

```sh
npm install --global maezato
```

Please note that `git` should be available in the system where this tool is planned to be used.

## Usage

This tool uses [the GitHub API v3](https://developer.github.com/v3/)
and requires [a personal API token](https://github.com/blog/1509-personal-api-tokens)
for authentication.
The token should be set to an environment variable called `GITHUB_TOKEN` or the command line
option named `--token`.

Use via command line, always with exactly two arguments and with possible options:

```sh
maezato [options] <username> <target path>
```

The cloning of a given repository uses the `ssh_url` property, hence
[the SSH keys should be configured properly](https://help.github.com/articles/generating-ssh-keys/).

Possible command line options are:

```sh
  -h, --help       output usage information
  -V, --version    output the version number
  -t, --token      GitHub API personal authentication token
  -s, --save-json  Save API calls as JSON files, possibly for debugging
```

For example getting all of the repositories of `@nodejs` under `~/github`:

```sh
maezato nodejs ~/github
```

## Directory structure

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

## Version history

* 2015-10-29    v0.3.0    Command line options
* 2015-10-26    v0.2.0    Using `gh-got` for network connectivity
* 2015-10-23    v0.1.0    Gets the job done, hence first release

## License

Licensed under [the MIT license](LICENSE).

Copyright (c) [Juga Paazmaya](http://paazmaya.fi)
