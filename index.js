/**
 * maezato
 * https://github.com/paazmaya/maezato
 *
 * Clone all repositories of a given user or organization at GitHub,
 * by ordering them according to fork/contributing/mine
 * @see https://developer.github.com/v3/repos/#list-user-repositories
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (https://paazmaya.fi)
 * Licensed under the MIT license
 */

import each from 'promise-each';
import Progress from 'progress';

import getRepos from './lib/get-repos.js';
import cloneRepo from './lib/clone-repo.js';

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
 *
 * @param {array} list  List of repositories for the given user
 * @param {object} options Options
 * @param {string} options.token GitHub API token
 * @param {boolean} options.verbose Enable more verbose output
 * @param {boolean} options.omitUsername Skip creating the username directory
 * @param {boolean} options.includeArchived Include also repositories that have been archived
 * @param {string} options.username GitHub username or organization if it begins with @
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
  const progressBar = new Progress(`Processing ${list.length} repositories [:bar] :percent`, {
    total: list.length * 2,
    complete: '#',
    incomplete: '-'
  });

  return Promise.resolve(list).then(each((item) => cloneRepo(item, progressBar, options)));
};

/**
 * Executioner
 *
 * @param {object} options Options
 * @param {string} options.token GitHub API token
 * @param {boolean} options.verbose Enable more verbose output
 * @param {boolean} options.omitUsername Skip creating the username directory
 * @param {boolean} options.includeArchived Include also repositories that have been archived
 * @param {string} options.username GitHub username or organization if it begins with @
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
