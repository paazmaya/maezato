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

import {
  exec
} from 'node:child_process';

import literals from './literals.js';

/**
 * Item is passed on success
 *
 * @param {object}  item      Meta data for the given repository
 * @param {string}  forkPath  File path where the repository has been cloned
 * @param {string}  name      Remote name
 * @param {string}  url       Remote URL
 * @param {object}  options          Options
 * @param {string}  options.token    GitHub API token
 * @param {boolean} options.verbose  Enable more verbose output
 * @param {boolean} options.omitUsername Skip creating the username directory
 * @param {string}  options.username GitHub username or organization if it begins with @
 * @param {string}  options.cloneBaseDir Base directory for cloning
 * @returns {Promise} Promise that solves when git remote has added
 */
const addRemote = (item, forkPath, name, url, options) => {
  const command = `git remote add ${name} ${url}`,
    opts = {
      cwd: forkPath,
      env: process.env,
      encoding: 'utf8'
    };

  if (options.verbose) {
    console.log(`Adding remote information "${name}" = "${url}"`);
  }

  return new Promise((fulfill, reject) => {
    exec(command, opts, (error, stdout, stderr) => {
      if (error && stderr.indexOf(`remote ${name} already exists`) === literals.INDEX_NOT_FOUND) {
        console.error(`Adding remote "${name}" failed for "${url}"`);
        console.error(stderr);
        reject(error, stderr);
      }
      else {
        fulfill(item);
      }
    });
  });
};

export default addRemote;
