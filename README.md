# maezato

> Clone all repositories of a given user at GitHub,
> by ordering them according to fork/contributing/mine

## Installation

Install globally with `npm`, as this tool is a command line tool:

```sh
npm install --global maezato
```

## Usage

This tool uses the GitHub API v3 and uses a token for authentication.
The token should be set to an environment variable called `GITHUB_TOKEN`.

Use via command line, always with exactly two arguments:

```sh
maezato <username> <path>
```

## Version history

* 2015-10-26    v0.2.0    Using `gh-got` for network connectivity
* 2015-10-23    v0.1.0    Gets the job done, hence first release

## License

Licensed under [the MIT license](LICENSE).

Copyright (c) [Juga Paazmaya](http://paazmaya.fi)
