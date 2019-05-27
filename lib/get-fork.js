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

const gotConfig = require('./got-config'),
  literals = require('./literals');

/**
 * Get the information for a fork repository.
 * - parent is the repository this repository was forked from
 * - source is the ultimate source for the network
 *
 * @param {string} user      GitHub username
 * @param {string} repo      Repository name
 * @param {object}  options          Options
 * @param {string}  options.token    GitHub API token
 * @param {boolean} options.verbose  Enable more verbose output
 * @param {boolean} options.omitUsername Skip creating the username directory
 * @param {string}  options.username GitHub username
 * @param {string}  options.cloneBaseDir Base directory for cloning
 * @returns {Promise} Promise that solves when got has received and git commands are done
 * @see https://developer.github.com/v3/repos/#get
 */
const getFork = (user, repo, options) => {
  const url = `${literals.GITHUB_API_URL}/repos/${user}/${repo}`,
    opts = gotConfig(options.token);

  return got(url, opts)
    .then((response) => {
      if (options.verbose) {
        console.log(`Received fork data for URL "${url}"`);
      }

      return response.body;
    })
    .catch((error) => {
      console.error('Getting fork information failed.');
      console.error(error.message);
    });
};

module.exports = getFork;
