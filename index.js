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
  got = require('got'),
  each = require('promise-each'),
  commander = require('commander');

const pjson = fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8');
const info = parseJson(pjson),
  API_URL = 'https://api.github.com/',
  INDEX_NOT_FOUND = -1;

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

const username = commander.args[0],
  cloneBaseDir = path.resolve(commander.args[1]),
  token = commander.token || process.env.GITHUB_TOKEN,
  userAgent = `${info.name} v${info.version}`;

if (!token) {
  console.log('GitHub authentication token missing');
  console.log('Please set it via GITHUB_TOKEN environment variable or --token option');
  process.exit();
}

console.log(`${info.name} - Clone all GitHub repositories of a given user`);
console.log(`Cloning to a structure under "${cloneBaseDir}"`);
mkdirp(cloneBaseDir);

const gotOptions = {
  headers: {
    accept: 'application/vnd.github.v3+json',
    'user-agent': userAgent,
    authorization: `token ${token}`
  },
  json: true
};

getRepos().then((data) => {
  return handleRepos(data);
}).then(() => {
  console.log('All done, thank you!');
});

function getRepos () {
  if (commander.verbose) {
    console.log(`Fetching information about all the user repositories for ${username}`);
  }

  // TODO: take care of paging. Someone might have more than 100 repositories...
  return got(`${API_URL}users/${username}/repos?type=all&per_page=100`, gotOptions)
    .then((response) => {
      return saveJson(response.body, path.join(cloneBaseDir, `${username}-repositories.json`));
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
  return new Promise((fulfill, reject) => {
    if (commander.saveJson) {
      if (commander.verbose) {
        console.log(` Saving JSON file: ${filepath}`);
      }
      fs.writeFile(filepath, JSON.stringify(data, null, '  '), 'utf8', (error) => {
        if (error) {
          reject(error);
        }
        else {
          fulfill(data);
        }
      });
    }
    else {
      fulfill(data);
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
  const url = `${API_URL}repos/${user}/${repo}`;

  return got(url, gotOptions)
    .then((response) => {
      if (commander.verbose) {
        console.log(` Received fork data for URL: ${url}`);
      }
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
 * @param {object} item      Meta data for the given repository
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

  if (commander.verbose) {
    console.log(` Adding remote information, ${name} ==>  ${url}`);
  }
  return new Promise((fulfill, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error && stderr.indexOf(`remote ${name} already exists`) === INDEX_NOT_FOUND) {
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

  if (commander.verbose) {
    console.log(`Cloning repository ${item.ssh_url}`);
  }
  return new Promise((fulfill, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      if (error && stderr.indexOf('already exists and is not an empty directory') === INDEX_NOT_FOUND) {
        console.error(` Cloning failed for ${item.ssh_url}`);
        reject(error, stderr);
      }
      else {
        fulfill(item);
      }
    });
  }).then((data) => {
    if (data.fork) {
      return getFork(path.join(clonePath, data.name), data.owner.login, data.name);
    }

    return data;
  });
}

/**
 *
 * @param {array} list  List of repositories for the given user
 * @returns {Promise}
 */
function handleRepos (list) {
  console.log(`Total of ${list.length} repositories to process`);
  console.log('');

  return Promise.resolve(list).then(each(cloneRepo));
}

/**
 * Safe parsing JSON
 *
 * @param {strin} text  JSON string
 * @return {object}
 */
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
