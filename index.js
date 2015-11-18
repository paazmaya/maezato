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
  spawnSync = require('child_process').spawnSync;

const mkdirp = require('mkdirp').sync,
  got = require('got'),
  commander = require('commander');

const pjson = fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8');
const info = parseJson(pjson),
  API_URL = 'https://api.github.com/';


commander
  .version(info.version)
  .usage('[options] <username> <target path>')
  .option('-t, --token', 'GitHub API personal authentication token')
  .option('-s, --save-json', 'Save API calls as JSON files, possibly for debugging')
 // .option('-x, --exclude', 'Exclude certain type of repositories, [fork]')
  .parse(process.argv);

if (commander.args.length !== 2) {
  console.log(' Seem to be missing <username> or <target path> hence exiting');
  process.exit();
}

const username = commander.args[0],
  cloneBaseDir = path.resolve(commander.args[1]),
  token = commander.token || process.env.GITHUB_TOKEN,
  userAgent = `${info.name} v${info.version}`;

if (!token) {
  console.log(' GitHub authentication token missing');
  console.log(' Please set it via GITHUB_TOKEN environment variable or --token option');
  process.exit();
}

console.log(`${info.name} - Clone all GitHub repositories of a given user`);
console.log(` Cloning to a structure under "${cloneBaseDir}"`);
mkdirp(cloneBaseDir);

const gotOptions = {
  headers: {
    'user-agent': userAgent,
    authorization: `token ${token}`
  },
  json: true
};


getRepos();

function getRepos () {
  console.log(` Fetching information about all the user repositories for ${username}`);

  // TODO: take care of paging. Someone might have more than 100 repositories...
  got(`${API_URL}users/${username}/repos?type=all&per_page=100`, gotOptions)
    .then((response) => {
      handleRepos(response.body);
    })
    .catch((error) => {
      console.error(' Fetching repository list failed.');
      console.error(error.response.body);
    });
}


function saveJson (filepath, data) {
  if (commander.saveJson) {
    fs.writeFileSync(filepath, JSON.stringify(data, null, '  '), 'utf8');
  }
}


function handleFork (item, forkPath) {
  saveJson(path.join(cloneBaseDir, `${item.owner.login}-fork-${item.name}.json`), item);

  console.log(' Adding remote information to the fork clone');

  /*
  parent is the repository this repository was forked from,
  source is the ultimate source for the network.
  */

  let args = ['remote', 'add', 'upstream', item.parent.git_url];
  const options = {
    cwd: forkPath,
    env: process.env,
    encoding: 'utf8'
  };
  let output = spawnSync('git', args, options);

  if (output.error) {
    console.error(` Adding remote "upstream" failed for ${item.name}. Error: ${output.error.errno}`);
  }

  args = ['remote', 'add', 'original', item.source.git_url];
  output = spawnSync('git', args, options);
  if (output.error) {
    console.error(` Adding remote "original" failed for ${item.name}. Error: ${output.error.errno}`);
  }
}

function getFork (forkPath, user, repo) {
  got(`${API_URL}repos/${user}/${repo}`, gotOptions)
    .then((response) => {
      handleFork(response.body, forkPath);
    })
    .catch((error) => {
      console.error(' Getting fork details failed.');
      console.error(error.response.body);
    });
}

function cloneRepo (item) {
  const type = item.fork ? 'fork' :
    (item.owner.login === username ? 'mine' : 'contributing');

  const clonePath = path.join(cloneBaseDir, username, type);

  mkdirp(clonePath);

  const args = ['clone', item.ssh_url];
  const options = {
    cwd: clonePath,
    env: process.env,
    encoding: 'utf8'
  };

  const output = spawnSync('git', args, options);

  if (output.error) {
    console.error(` Cloning failed for ${item.name}. Error: ${output.error.errno}`);
  }
  else if (item.fork) {
    // Get information about the parent repository
    getFork(path.join(clonePath, item.name), item.owner.login, item.name);
  }
}

function handleRepos (data) {
  saveJson(path.join(cloneBaseDir, `${username}-repositories.json`), data);
  console.log(`Total of ${data.length} repositories to process`);
  console.log('');

	data.forEach((item) => {
    console.log(`Processing ${item.full_name}`);
    cloneRepo(item);
    console.log('');
	});
}

function parseJson (text) {
  let data;

  try {
    data = JSON.parse(text);
  }
  catch (error) {
    console.error(` Parsing JSON failed. ${error}`);
  }
  return data;
}


