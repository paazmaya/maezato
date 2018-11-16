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

const got = require('got');

const gotConfig = require('./got-config');

/**
 * Get a list of repositories
 *
 * @param  {object}  options          Options
 * @param  {string}  options.token    GitHub API token
 * @param  {boolean} options.verbose  Enable more verbose output
 * @param  {boolean} options.omitUsername Skip creating the username directory
 * @param  {string}  options.username GitHub username
 * @param  {string}  options.cloneBaseDir Base directory for cloning
 * @return {Promise} Promise that solves when got received
 * @see https://developer.github.com/v3/repos/#list-user-repositories
 */
const getRepos = (options) => {
  if (options.verbose) {
    console.log(`Fetching information about all the user repositories for "${options.username}"`);
  }

  // TODO: take care of paging. Someone might have more than 100 repositories...
  const opts = gotConfig(options.token);
  return got(`https://api.github.com/users/${options.username}/repos?type=all&per_page=100`, opts)
    .then((response) => {
      return response.body;
    })
    .catch((error) => {
      console.error(' Fetching repository list failed.');
      console.error(error.response.body);
    });
};

module.exports = getRepos;
