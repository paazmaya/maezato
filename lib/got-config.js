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

const literals = require('./literals');

/**
 * Configuration object for GitHub API connection with got.
 *
 * @param {string} token The API token for GitHub, which should 40 characters long
 * @returns {Object} Configuration object for got
 */
const gotConfig = (token) => ({
  json: true,
  headers: {
    accept: literals.GITHUB_API_TYPE,
    authorization: `token ${token}`,
    'user-agent': literals.USER_AGENT
  },
  method: 'GET'
});

module.exports = gotConfig;
