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
 * Determine repository type based on its properties
 *
 * @param {object} item Repository item
 * @param {boolean} item.template Whether it's a template
 * @param {boolean} item.fork Whether it's a fork
 * @param {string} item.owner Repository owner
 * @param {string} options.username GitHub username or organization
 * @returns {string} Repository type: templates, fork, mine, or contributing
 */
const getRepositoryType = (item, options) => {
  if (item.template) {
    return 'templates';
  }
  if (item.fork) {
    return 'fork';
  }
  if (item.owner === options.username) {
    return 'mine';
  }

  return 'contributing';
};

/**
 * Build the clone path for the repository
 *
 * @param {string} type Repository type
 * @param {object} options Options
 * @param {boolean} options.omitUsername Skip creating the username directory
 * @param {string} options.username GitHub username or organization
 * @param {string} options.cloneBaseDir Base directory for cloning
 * @returns {string} The full clone path
 */
const buildClonePath = (type, options) => {
  return options.omitUsername ?
    path.join(options.cloneBaseDir, type) :
    path.join(options.cloneBaseDir, options.username, type);
};

/**
 * Build git clone command
 *
 * @param {string} sshUrl SSH URL of the repository
 * @returns {string} Git clone command
 */
const buildGitCloneCommand = (sshUrl) => {
  return `git clone ${sshUrl}`;
};

/**
 * Build exec options for running git clone
 *
 * @param {string} clonePath Path where to clone
 * @returns {object} Exec options
 */
const buildExecOptions = (clonePath) => {
  return {
    cwd: clonePath,
    env: process.env,
    encoding: 'utf8'
  };
};

/**
 * Handle exec callback for git clone
 *
 * @param {Error|null} error Error object if command failed
 * @param {string} stdout Standard output
 * @param {string} stderr Standard error output
 * @param {string} sshUrl SSH URL for error message
 * @param {Function} fulfill Promise fulfill function
 * @param {Function} reject Promise reject function
 */
const handleExecCallback = (error, stdout, stderr, sshUrl, fulfill, reject) => {
  // TODO: how about terminals with other languages than english?
  if (error && stderr.indexOf('already exists and is not an empty directory') === literals.INDEX_NOT_FOUND) {
    console.error(`Failed to clone "${sshUrl}"`);
    reject(error, stderr);
  }
  else {
    fulfill();
  }
};

/**
 * Execute git clone command in the specified directory
 *
 * @param {string} sshUrl SSH URL of the repository
 * @param {string} clonePath Path where to clone
 * @param {object} options Options
 * @param {boolean} options.verbose Enable more verbose output
 * @returns {Promise} Promise that resolves when clone completes
 */
const executeGitClone = (sshUrl, clonePath, options) => {
  const command = buildGitCloneCommand(sshUrl);
  const opts = buildExecOptions(clonePath);

  if (options.verbose) {
    console.log(`Cloning repository ${sshUrl}`);
  }

  return new Promise((fulfill, reject) => {
    exec(command, opts, (error, stdout, stderr) => {
      handleExecCallback(error, stdout, stderr, sshUrl, fulfill, reject);
    });
  });
};

/**
 * Add upstream remote for fork repositories
 *
 * @param {object} data Repository data
 * @param {string} clonePath Path where repository was cloned
 * @param {object} options Options
 * @returns {Promise} Promise that resolves when remote is added
 */
const handleForkRemote = (data, clonePath, options) => {
  const forkPath = path.join(clonePath, data.name);

  return addRemote(data, forkPath, 'upstream', data.parent.ssh_url, options);
};

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
 * @param {string}  options.username GitHub username or organization if it begins with @
 * @param {string}  options.cloneBaseDir Base directory for cloning
 *
 * @returns {Promise} Promise that solved when git has cloned
 */
const cloneRepo = (item, progressBar, options) => {
  const type = getRepositoryType(item, options);
  const clonePath = buildClonePath(type, options);

  mkdirp.sync(clonePath);

  return executeGitClone(item.ssh_url, clonePath, options)
    .then(() => {
      if (!options.verbose) {
        progressBar.tick();
        progressBar.render();
      }

      if (item.fork) {
        return handleForkRemote(item, clonePath, options);
      }

      return item;
    })
    .then(() => {
      if (!options.verbose) {
        progressBar.tick();
        progressBar.render();
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

export default cloneRepo;
export {
  getRepositoryType,
  buildClonePath,
  buildGitCloneCommand,
  buildExecOptions,
  handleExecCallback,
  executeGitClone,
  handleForkRemote
};
