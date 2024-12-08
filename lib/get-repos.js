/**
 * maezato
 * https://github.com/paazmaya/maezato
 *
 * Clone all repositories of a given user or organization at GitHub,
 * by ordering them according to fork/contributing/mine
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (https://paazmaya.fi)
 * Author: Priyansh Jain <priyanshjain412@gmail.com>
 * Licensed under the MIT license
 */

import {
  graphql
} from '@octokit/graphql';
import literals from './literals.js';

/**
 * Performs a request via the graphql API
 * @param {object} options
 * @param {string} options.username GitHub username or organization if it begins with @
 * @param {string} options.token GitHub API token
 * @param {string} options.query GraphQL query
 * @param {string} options.nextCursor If paginating, cursor for next page
 */
export const performRequest = (options) => {
  const {
    username,
    token,
    nextCursor = null,
    query
  } = options;

  return graphql({
    query,
    username,
    nextCursor,
    headers: {
      authorization: `bearer ${token}`,
      'user-agent': literals.USER_AGENT
    }
  }).then((response) => {
    /*
    import('fs').then((fs) => {
      fs.writeFileSync(`users-${options.username}-repos.json`, JSON.stringify(response, null, '  '), 'utf8');
    });
    */

    return response.user?.repositories || response.organization?.repositories;
  }).catch((error) => {
    return Promise.reject(error);
  });
};

/**
 * Uses a map function to structure the object as per needs
 *
 * @param {array}   list      List of all repositories
 * @param {object}  list[i]   List object
 * @param {boolean} list[i].isFork        If the repository is a fork
 * @param {string}  list[i].nameWithOwner Name of the repository with owner
 * @param {string}  list[i].sshUrl        SSH URL of the repository
 * @param {object}  list[i].parent        Parent repo object details, if it is a fork
 * @param {string}  list[i].parent.sshUrl SSH URL of the parent repository
 */
export const handleList = (list) => {

  const repoList = list.map((repo) => {
    const [owner, repoName] = repo.nameWithOwner.split('/');

    return {
      fork: repo.isFork,
      owner: owner,
      name: repoName,
      ssh_url: repo.sshUrl,
      parent: {
        ssh_url: repo.parent ?
          repo.parent.sshUrl :
          null
      }
    };
  });

  return repoList;
};

/**
 * Get a list of repositories
 *
 * @param {object} options Options
 * @param {string}  options.token    GitHub API token
 * @param {boolean} options.verbose  Enable more verbose output
 * @param {boolean} options.omitUsername Skip creating the username directory
 * @param {string}  options.username GitHub username or organization if it begins with @
 * @param {string}  options.cloneBaseDir Base directory for cloning
 * @return {Promise} Promise that solves when got received
 */
const getRepos = (options, list = []) => {

  if (options.verbose) {
    console.log(`Fetching information about all the user repositories for "${options.username}"`);
  }

  options.query = literals.QUERY_USER_REPOS;
  if (options.username.startsWith('@')) {
    options.username = options.username.slice(1);
    options.query = literals.QUERY_ORG_REPOS;
  }

  return performRequest(options).then((response) => {
    list.push(...response.nodes);
    if (!response.pageInfo.hasNextPage) {
      return handleList(list);
    }
    options.nextCursor = response.pageInfo.endCursor;

    return getRepos(options, list);
  }).catch((err) => Promise.reject(err));
};


export default getRepos;
