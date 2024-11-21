/**
 * maezato
 * https://github.com/paazmaya/maezato
 *
 * Clone all repositories of a given user or organization at GitHub,
 * by ordering them according to fork/contributing/mine
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (https://paazmaya.fi)
 * Licensed under the MIT license
 */

import path from 'node:path';
import {
  exec
} from 'node:child_process';

import {
  mkdirp
} from 'mkdirp';

import addRemote from './add-remote.js';
import literals from './literals.js';

/**
 * Clone a repository
 *
 * @param {object}  item             Meta data for the given repository
 * @param {object}  progressBar      Instance of Progress bar
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
const cloneRepo = (item, progressBar, options) => {
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
      if (!options.verbose) {
        progressBar.tick();
        progressBar.render();
      }

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

    if (!options.verbose) {
      progressBar.tick();
      progressBar.render();
    }

    if (data.fork) {
      const forkPath = path.join(clonePath, data.name);

      return addRemote(data, forkPath, 'upstream', data.parent.ssh_url, options);
    }

    return data;
  }).catch((error) => {
    console.error(error);
  });
};

export default cloneRepo;