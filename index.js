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

const gotConfig = require('./lib/got-config'),
  getRepos = require('./lib/get-repos');

const GH_API_URL = 'https://api.github.com/',
  INDEX_NOT_FOUND = -1;

let progressBar,
  cmdOptions;

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
    opts = {
      cwd: forkPath,
      env: process.env,
      encoding: 'utf8'
    };

  if (cmdOptions.verbose) {
    console.log(` Adding remote information, ${name} ==>  ${url}`);
  }

  return new Promise((fulfill, reject) => {
    exec(command, opts, (error, stdout, stderr) => {
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
 * @see https://developer.github.com/v3/repos/#get
 */
const getFork = (forkPath, user, repo) => {
  const url = `${GH_API_URL}repos/${user}/${repo}`,
    opts = gotConfig(cmdOptions.token);

  return got(url, opts)
    .then((response) => {
      if (cmdOptions.verbose) {
        console.log(` Received fork data for URL: ${url}`);
      }

      fs.writeFileSync(`repos-${user}-${repo}.json`, JSON.stringify(response.body, null, '  '), 'utf8');

      return response.body;
    })
    .then((item) => {
      return addRemote(item, forkPath, 'upstream', item.parent.ssh_url);
    })
    .then((item) => {
      return addRemote(item, forkPath, 'original', item.source.ssh_url);
    })
    .catch((error) => {
      console.error(' Getting fork details failed.');
      console.error(error.response.body);
    });
};

/**
 * Clone a repository
 *
 * @param  {object}  item             Meta data for the given repository
 * @param  {object}  options          Options
 * @param  {string}  options.token    GitHub API token
 * @param  {boolean} options.verbose  Enable more verbose output
 * @param  {boolean} options.omitUsername Skip creating the username directory
 * @param  {string}  options.username GitHub username
 * @param  {string}  options.cloneBaseDir Base directory for cloning
 * @returns {Promise} Promise that solved when git has cloned
 */
const cloneRepo = (item, options) => {
  const type = item.fork ?
    'fork' :
    item.owner.login === options.username ?
      'mine' :
      'contributing';

  const clonePath = options.omitUsername ?
    path.join(options.cloneBaseDir, type) :
    path.join(options.cloneBaseDir, options.username, type);

  mkdirp(clonePath);

  const command = `git clone ${item.ssh_url}`,
    opts = {
      cwd: clonePath,
      env: process.env,
      encoding: 'utf8'
    };

  if (options.verbose) {
    console.log(`Cloning repository ${item.ssh_url}`);
  }

  return new Promise((fulfill, reject) => {
    exec(command, opts, (error, stdout, stderr) => {
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

    progressBar.tick();
    progressBar.render();

    if (data.fork) {
      return getFork(path.join(clonePath, data.name), data.owner.login, data.name);
    }

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

  return Promise.resolve(list).then(each((item) => cloneRepo(item, cmdOptions)));
};

/**
 * Executioner
 *
 * @param  {object} options Options
 * @param  {string} options.token GitHub API token
 * @param  {boolean} options.verbose Enable more verbose output
 * @param  {boolean} options.omitUsername Skip creating the username directory
 * @param  {string} options.username GitHub username
 * @param  {string} options.cloneBaseDir Base directory for cloning
 * @return {void}
 */
const run = (options) => {
  cmdOptions = options;

  console.log(`Cloning to a structure under "${options.cloneBaseDir}"`);

  mkdirp(options.cloneBaseDir);

  getRepos(options)
    .then((data) => {
      console.log(Object.keys(data));
      fs.writeFileSync(`users-${options.username}-repos.json`, JSON.stringify(data, null, '  '), 'utf8');
      return handleRepos(data);
    })
    .then(() => {
      console.log('All done, thank you!');
    })
    .catch((error) => {
      console.error('Something failed here.');
      console.error(error);
    });
};

module.exports = run;
module.exports.parseJson = parseJson;

// Exported for testing
module.exports._addRemote = addRemote;
module.exports._getFork = getFork;
module.exports._cloneRepo = cloneRepo;
module.exports._handleRepos = handleRepos;
