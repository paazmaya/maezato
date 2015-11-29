#!/usr/bin/env node

/**
 * maezato
 * https://github.com/paazmaya/maezato
 *
 * Clone all repositories of a given user at GitHub,
 * by ordering them according to fork/contributing/mine
 * @see https://developer.github.com/v3/repos/#list-user-repositories
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (http://paazmaya.fi)
 * Licensed under the MIT license
 */

'use strict';

const fs = require('fs'),
  path = require('path'),
  exec = require('child_process').exec;

const mkdirp = require('mkdirp').sync,
  commander = require('commander');

const maezato = require('../index');

const pjson = fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8');
const info = maezato.parseJson(pjson);

commander
  .version(info.version)
  .usage('[options] <username> <target path>')
  .option('-v, --verbose', 'Print out more stuff')
  .option('-t, --token', 'GitHub API personal authentication token')
  .option('-s, --save-json', 'Save API calls as JSON files, possibly for debugging')
 // .option('-x, --exclude', 'Exclude certain type of repositories, [fork]')
  .parse(process.argv);

if (commander.args.length !== 2) {
  console.log('Seem to be missing <username> or <target path> hence exiting');
  process.exit();
}

const token = commander.token || process.env.GITHUB_TOKEN;

if (!token) {
  console.log('GitHub authentication token missing');
  console.log('Please set it via GITHUB_TOKEN environment variable or --token option');
  process.exit();
}

console.log(`${info.name} - Clone all GitHub repositories of a given user`);

commander.token = token;
maezato.run(commander);

