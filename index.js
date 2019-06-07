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

//const fs = require('fs');
const path = require('path'),
  {
    exec
  } = require('child_process');

const mkdirp = require('mkdirp').sync,
  each = require('promise-each'),
  Progress = require('progress');

const getRepos = require('./lib/get-repos'),
  addRemote = require('./lib/add-remote'),
  getFork = require('./lib/get-fork'),
  literals = require('./lib/literals');

let progressBar;

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
 * Clone a repository
 *
 * @param {object}  item             Meta data for the given repository
 * @param {object}  options          Options
 * @param {string}  options.token    GitHub API token
 * @param {boolean} options.verbose  Enable more verbose output
 * @param {boolean} options.omitUsername Skip creating the username directory
 * @param {string}  options.username GitHub username
 * @param {string}  options.cloneBaseDir Base directory for cloning
 *
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

      // TODO: how about terminals with other languages?
      if (error && stderr.indexOf('already exists and is not an empty directory') === literals.INDEX_NOT_FOUND) {
        console.error(`Failed to clone "${item.ssh_url}"`);
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
      const forkPath = path.join(clonePath, data.name);

      return getFork(forkPath, data.owner.login, data.name, options)
        .then((body) => addRemote(body, forkPath, 'upstream', body.parent.ssh_url, options))
        .then((body) => addRemote(body, forkPath, 'original', body.source.ssh_url, options))
        .catch((error) => console.error(error.message));
    }

    return data;
  });
};

/**
 *
 * @param {array} list  List of repositories for the given user
 * @param  {object} options Options
 * @param  {string} options.token GitHub API token
 * @param  {boolean} options.verbose Enable more verbose output
 * @param  {boolean} options.omitUsername Skip creating the username directory
 * @param  {string} options.username GitHub username
 * @param  {string} options.cloneBaseDir Base directory for cloning
 *
 * @returns {Promise} Promise that should have resolved everything
 */
const handleRepos = (list, options) => {

  // Show command line progress.
  progressBar = new Progress(`Processing ${list.length} repositories [:bar] :percent`, {
    total: list.length * 2,
    complete: '#',
    incomplete: '-'
  });

  return Promise.resolve(list).then(each((item) => cloneRepo(item, options)));
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
 *
 * @returns {void}
 */
const run = (options) => {
  console.log(`Cloning to a structure under "${options.cloneBaseDir}"`);

  mkdirp(options.cloneBaseDir);

  getRepos(options)
    .then((data) => {
      //fs.writeFileSync(`users-${options.username}-repos.json`, JSON.stringify(data, null, '  '), 'utf8');

      return handleRepos(data, options);
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
module.exports._cloneRepo = cloneRepo;
module.exports._handleRepos = handleRepos;
