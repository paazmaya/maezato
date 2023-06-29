# Version history for maezato (前里)

This changelog covers the version history and possible upcoming changes.
It follows the guidance from https://keepachangelog.com/en/1.0.0/.

## Unreleased

- Minimum supported Node.js version lifted from `14.15.0` to `16.13.0`, along with minimum npm version from `6.14.8` to `8.1.0`
- Minimum supported Node.js version lifted from `14.15.0` to `18.12.0`

## `v0.13.0` (2023-06-07)

- It's all ES Modules now

## `v0.12.0` (2022-04-19)
- Minimum supported Node.js version lifted from `10.13.0` to `14.15.0`, along with minimum npm version to `6.14.8`
- Keep dependencies up to date, to reduce vulnerabilities

## `v0.11.0` (2021-02-16)
- Do not clone an archived repository, unless the option `include-archived` is used

## `v0.10.1` (2021-02-06)
- GraphQL query had a requirement to always provide next cursor, which caused issues that have now been solved

## `v0.10.0` (2021-02-03)
- Migrated GitHub API from v3 to v4 and started using GraphQL which reduces the network utilisation #78
- Forks no longer have the remote called `original`, which contained the `ssh_url` of the ultimate source repository for the fork
- Need to migrate all but one test execution away from Travis CI due to free account limitations
- Now using GitHub Actions to execute tests with Node.js v14 and AppVeyor for v12, while Travis CI handles v10
- Minimum Node.js version lifted from `8.11.1` to `10.13.0`

## `v0.9.2` (2019-06-10)
- Linting helps to find `undefined` items...

## `v0.9.1` (2019-06-10)
- Fork data fetching failed due to function refactoring which changed the number of arguments

## `v0.9.0` (2019-06-07)
- User agent now contains the version of this tool
- In case an error occurs against the API, show the URL used

## `v0.8.2` (2019-05-27)
- Started testing against Node.js version 12
- Using `renovate` to keep dependencies up to date via Pull Requests
- Minor refaction for clearer code structure and better unit test coverage

## `v0.8.1` (2019-03-05)
- Takes long to notice crucial bugs, such as not having `lib` folder in the package #17

## `v0.8.0` (2019-01-27)
- Fixed progress bar not filling to the end due to not counting forks
- Removed `saveJson` option, since it was initially just for debugging the API payload
- Use SSH urls for fork remotes #16

## `v0.7.0` (2018-10-05)
- Option for omitting the username directory from the resulting directory structure #15
- Include `npm-shrinkwrap.json` in the package to ensure working dependency versions

## `v0.6.0` (2018-08-10)
- Minimum Node.js version lifted from `4.2.0` to `8.11.1`
- Default to current working directory when path not defined #14
- Display progress #12

## `v0.5.3` (2016-08-13)
- `bin` was not included in the npm package

## `v0.5.2` (2016-08-08)
- Version info does not print tool name #9
- Using shared ESLint configuration #8
- Started testing with Windows at AppVeyor
- Move code coverage from `instanbul` to `nyc`

## `v0.5.1` (2016-03-12)
- Wrong properties used

## `v0.5.0` (2016-03-12)
- Command line code separation so testing can be started
- Update dependencies plenty

## `v0.4.0` (2015-11-18)
- Everything with Promises
- Back to using `got` instead of `gh-got`

## `v0.3.0` (2015-10-29)
- Command line options #2

## `v0.2.0` (2015-10-26)
- Using `gh-got` for network connectivity #1

## `v0.1.0` (2015-10-23)
- Gets the job done, hence first release
