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

import path from 'node:path';
import {
  exec
} from 'node:child_process';

import each from 'promise-each';
import Progress from 'progress';

import {
  mkdirp
} from 'mkdirp';

import getRepos from './lib/get-repos.js';
import addRemote from './lib/add-remote.js';
import literals from './lib/literals.js';

let progressBar;

/**
 * Safe parsing JSON
 *
 * @param {string} text  JSON string
 * @returns {object} Data object
 */
export const parseJson = (text) => {
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
 * @param {boolean} options.includeArchived Include also repositories that have been archived
 * @param {string}  options.username GitHub username
 * @param {string}  options.cloneBaseDir Base directory for cloning
 *
 * @returns {Promise} Promise that solved when git has cloned
 */
export const cloneRepo = (item, options) => {
  const type = item.fork ?
    'fork' :
    item.owner === options.username ?
      'mine' :
      'contributing';

  const clonePath = options.omitUsername ?
    path.join(options.cloneBaseDir, type) :
    path.join(options.cloneBaseDir, options.username, type);

  mkdirp.sync(clonePath);

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

      return addRemote(data, forkPath, 'upstream', data.parent.ssh_url, options);
    }

    return data;
  }).catch((error) => {
    console.error(error);
  });
};

/**
 *
 * @param {array} list  List of repositories for the given user
 * @param {object} options Options
 * @param {string} options.token GitHub API token
 * @param {boolean} options.verbose Enable more verbose output
 * @param {boolean} options.omitUsername Skip creating the username directory
 * @param {boolean} options.includeArchived Include also repositories that have been archived
 * @param {string} options.username GitHub username
 * @param {string} options.cloneBaseDir Base directory for cloning
 *
 * @returns {Promise} Promise that should have resolved everything
 */
export const handleRepos = (list, options) => {
  if (!options.includeArchived) {
    list = list.filter((item) => {
      return !item.archived;
    });
  }

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
 * @param {object} options Options
 * @param {string} options.token GitHub API token
 * @param {boolean} options.verbose Enable more verbose output
 * @param {boolean} options.omitUsername Skip creating the username directory
 * @param {boolean} options.includeArchived Include also repositories that have been archived
 * @param {string} options.username GitHub username
 * @param {string} options.cloneBaseDir Base directory for cloning
 *
 * @returns {void}
 */
const run = (options) => {
  console.log(`Cloning to a structure under "${options.cloneBaseDir}"`);

  //mkdirp.sync(options.cloneBaseDir);

  getRepos(options)
    .then((data) => {

      return handleRepos(data, options);
    })
    .then(() => {
      console.log('All done, thank you!');
    })
    .catch((error) => {
      console.error('Something failed here.');
      if (options.verbose) {
        console.error(error);
      }
    });
};

export default run;
