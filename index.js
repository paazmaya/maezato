/**
 * maezato
 * https://github.com/paazmaya/maezato
 *
 * Clone all repositories of a given user at GitHub,
 * by ordering them according to fork/contributing/mine
 * @see https://developer.github.com/v3/repos/#list-user-repositories
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (https://paazmaya.fi)
 * Licensed under the MIT license
 */

'use strict';

const fs = require('fs'),
  path = require('path'),
  exec = require('child_process').exec;

const mkdirp = require('mkdirp').sync,
  got = require('got'),
  each = require('promise-each'),
  Progress = require('progress');

const GH_API_URL = 'https://api.github.com/',
  INDEX_NOT_FOUND = -1,
  userAgent = 'maezato cloner';

let progressBar,
  cmdOptions,
  gotOptions;

/**
 * Options for got module
 *
 * @returns {Object} Options for got module
 */
const getGotOptions = () => {
  return {
    headers: {
      accept: 'application/vnd.github.v3+json',
      'user-agent': userAgent,
      authorization: `token ${cmdOptions.token}`
    },
    json: true
  };
};

/**
 * Save a JSON file, in case it has been requested
 *
 * @param {object} data      Whatever JSON data there is to be saved
 * @param {string} filepath  Destination file path
 * @returns {Promise} Promise that solves when file has saved
 */
const saveJson = (data, filepath) => {
  return new Promise((fulfill, reject) => {
    if (cmdOptions.saveJson) {
      if (cmdOptions.verbose) {
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
};

/**
 * Safe parsing JSON
 *
 * @param {string} text  JSON string
 * @returns {object} Data object
 */
const parseJson = (text) => {
  let data;

  try {
    data = JSON.parse(text);
  }
  catch (error) {
    console.error(` Parsing JSON failed. ${error}`);
  }

  return data;
};

/**
 * Get a list of repositories
 *
 * @return {Promise} Promise that solves when got received
 */
const getRepos = () => {
  if (cmdOptions.verbose) {
    console.log(`Fetching information about all the user repositories for "${cmdOptions.username}"`);
  }

  // TODO: take care of paging. Someone might have more than 100 repositories...
  return got(`${GH_API_URL}users/${cmdOptions.username}/repos?type=all&per_page=100`, gotOptions)
    .then((response) => {
      return saveJson(response.body, path.join(cmdOptions.cloneBaseDir, `${cmdOptions.username}-repositories.json`));
    })
    .catch((error) => {
      console.error(' Fetching repository list failed.');
      console.error(error.response.body);
    });
};

/**
 * Item is passed on success
 *
 * @param {object} item      Meta data for the given repository
 * @param {string} forkPath  File path where the repository has been cloned
 * @param {string} name      Remote name
 * @param {string} url       Remote URL
 * @returns {Promise} Promise that solves when git remote has added
 */
const addRemote = (item, forkPath, name, url) => {
  const command = `git remote add ${name} ${url}`,
    options = {
      cwd: forkPath,
      env: process.env,
      encoding: 'utf8'
    };

  if (cmdOptions.verbose) {
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
};

/**
 * Get the information for a fork repository.
 * - parent is the repository this repository was forked from
 * - source is the ultimate source for the network
 *
 * @param {string} forkPath  File path where the repository has been cloned
 * @param {string} user      GitHub username
 * @param {string} repo      Repository name
 * @returns {Promise} Promise that solves when got has received and git commands are done
 */
const getFork = (forkPath, user, repo) => {
  const url = `${GH_API_URL}repos/${user}/${repo}`;

  return got(url, gotOptions)
    .then((response) => {
      if (cmdOptions.verbose) {
        console.log(` Received fork data for URL: ${url}`);
      }

      return response.body;
    })
    .then((item) => {
      return saveJson(item, path.join(cmdOptions.cloneBaseDir, `${item.owner.login}-fork-${item.name}.json`));
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
};

/**
 * Clone a repository
 *
 * @param {object} item  Meta data for the given repository
 * @returns {Promise} Promise that solved when git has cloned
 */
const cloneRepo = (item) => {
  const type = item.fork ?
    'fork' :
    item.owner.login === cmdOptions.username ?
      'mine' :
      'contributing';

  const clonePath = cmdOptions.omitUsername ?
    path.join(cmdOptions.cloneBaseDir, type) :
    path.join(cmdOptions.cloneBaseDir, cmdOptions.username, type);

  mkdirp(clonePath);

  const command = `git clone ${item.ssh_url}`,
    options = {
      cwd: clonePath,
      env: process.env,
      encoding: 'utf8'
    };

  if (cmdOptions.verbose) {
    console.log(`Cloning repository ${item.ssh_url}`);
  }

  return new Promise((fulfill, reject) => {
    exec(command, options, (error, stdout, stderr) => {
      progressBar.tick();
      progressBar.render();

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

    progressBar.tick();
    progressBar.render();

    return data;
  });
};

/**
 *
 * @param {array} list  List of repositories for the given user
 * @returns {Promise} Promise that should have resolved everything
 */
const handleRepos = (list) => {

  // Show command line progress.
  progressBar = new Progress(`Processing ${list.length} repositories [:bar] :percent`, {
    total: list.length * 2,
    complete: '#',
    incomplete: '-'
  });

  return Promise.resolve(list).then(each(cloneRepo));
};

/**
 * Executioner
 *
 * @param  {object} options Options
 * @param  {string} options.token GitHub API token
 * @param  {boolean} options.verbose Enable more verbose output
 * @param  {boolean} options.omitUsername Skip creating the username directory
 * @param  {boolean} options.saveJson Save incoming JSON payload to files
 * @param  {string} options.username GitHub username
 * @param  {string} options.cloneBaseDir Base directory for cloning
 * @return {void}
 */
const run = (options) => {
  cmdOptions = options;
  gotOptions = getGotOptions();

  console.log(`Cloning to a structure under "${cmdOptions.cloneBaseDir}"`);

  mkdirp(cmdOptions.cloneBaseDir);

  getRepos().then((data) => {
    return handleRepos(data);
  }).then(() => {
    console.log('All done, thank you!');
  });
};

module.exports = run;
module.exports.parseJson = parseJson;
module.exports.saveJson = saveJson;

// Exported for testing
module.exports._getGotOptions = getGotOptions;
module.exports._getRepos = getRepos;
module.exports._addRemote = addRemote;
module.exports._getFork = getFork;
module.exports._cloneRepo = cloneRepo;
module.exports._handleRepos = handleRepos;
