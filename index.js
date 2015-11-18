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
  spawnSync = require('child_process').spawnSync,
  spawn = require('child_process').spawn,
  exec = require('child_process').exec;

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
  return got(`${API_URL}users/${username}/repos?type=all&per_page=100`, gotOptions)
    .then((response) => {
      return saveJson(response.body, path.join(cloneBaseDir, `${username}-repositories.json`));
    })
    .then((data) => {
      return handleRepos(data);
    })
    .catch((error) => {
      console.error(' Fetching repository list failed.');
      console.error(error.response.body);
    });
}


/**
 * Save a JSON file, in case it has been requested
 *
 * @param {object} data      Whatever JSON data there is to be saved
 * @param {string} filepath  Destination file path
 * @returns {Promise}
 */
function saveJson (data, filepath) {
  return new Promise(function (fulfill, reject) {
    if (commander.saveJson) {
      fs.writeFile(filepath, JSON.stringify(data, null, '  '), 'utf8', function (error) {
        if (error) {
          reject(error);
        }
        else {
          fullfill(data);
        }
      });
    }
    else {
      fullfill(data);
    }
  });
}


/**
 * Get the information for a fork repository.
 * - parent is the repository this repository was forked from
 * - source is the ultimate source for the network
 *
 * @param {string} forkPath  File path where the repository has been cloned
 * @param {string} user      GitHub username
 * @param {string} repo      Repository name
 * @returns {Promise}
 */
function getFork (forkPath, user, repo) {
  return got(`${API_URL}repos/${user}/${repo}`, gotOptions)
    .then((response) => {
      return response.body;
    })
    .then((item) => {
      return saveJson(item, path.join(cloneBaseDir, `${item.owner.login}-fork-${item.name}.json`));
    })
    .then((item) => {
      return addRemote(item, forkPath, 'upstream', item.parent.git_url);
    })
    .then((item) => {
      return addRemote(item, forkPath, 'original', item.source.git_url);
    })
    .catch((error) => {
      console.error(' Getting fork details failed.');
      console.error(error.response.body);
    });
}

/**
 * Item is passed on success
 *
 * @param {string} forkPath  File path where the repository has been cloned
 * @param {string} name      Remote name
 * @param {string} url       Remote URL
 * @returns {Promise}
 */
function addRemote (item, forkPath, name, url) {
  const command = `git remote add ${name} ${url}`,
    options = {
      cwd: forkPath,
      env: process.env,
      encoding: 'utf8'
    };

  console.log(` Adding remote information, ${name} ==>  ${url}`);
  return new Promise(function (fulfill, reject) {
    exec(command, options, function (error, stdout, stderr) {
      // console.log(error);
      //console.log(stdout);
      // console.log(stderr);

      // It might be that
      // fatal: remote upstream already exists.
      // And that should be just fine
      if (error && stderr.indexOf(`remote ${name} already exists`) === -1) {
        console.error(` Adding remote "${name}" failed for ${url}`);
        reject(error, stderr);
      }
      else {
        fulfill(item);
      }
    });
  });
}



/**
 * Clone a repository
 *
 * @param {object} item  Meta data for the given repository
 * @returns {Promise}
 */
function cloneRepo (item) {
  const type = item.fork ? 'fork' :
    (item.owner.login === username ? 'mine' : 'contributing');

  const clonePath = path.join(cloneBaseDir, username, type);

  mkdirp(clonePath);


  const command = `git clone ${item.ssh_url}`,
    options = {
      cwd: clonePath,
      env: process.env,
      encoding: 'utf8'
    };

  console.log(` Cloning repository ${item.ssh_url}`);
  return new Promise(function (fulfill, reject) {
    exec(command, options, function (error, stdout, stderr) {
      console.log(error);
      console.log(stdout);
      console.log(stderr);
      if (error) {
        console.error(` Cloning failed for ${item.ssh_url}`);
        reject(error, stderr);
      }
      else {
        fulfill(item);
      }
    });
  });
}

function handleRepos (data) {
  console.log(`Total of ${data.length} repositories to process`);
  console.log('');

  Promise.all(data.map((item) => {
    console.log(`Processing ${item.full_name}`);

    return cloneRepo(item).then((item) => {
      if (item.fork) {
        return getFork(path.join(clonePath, item.name), item.owner.login, item.name);
      }
      return Promise.resolve();
    });

  })).then((results) => {
    console.log('All done, thank you!');
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


