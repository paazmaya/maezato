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

import fs from 'node:fs';

/* import PKG from '../package.json' assert { type: 'json' };*/
const packageFile = new URL('../package.json', import.meta.url);
const PKG = JSON.parse(fs.readFileSync(packageFile, 'utf8'));

export default {
  GITHUB_API_URL: 'https://api.github.com',
  INDEX_NOT_FOUND: -1,
  USER_AGENT: 'https://github.com/paazmaya/maezato v' + PKG.version,

  // https://docs.github.com/en/graphql/reference/queries#user
  // https://docs.github.com/en/graphql/reference/queries#repository
  QUERY_USER_REPOS: `query GetUserRepos($username: String!, $nextCursor: String) {
    user(login:$username) {
      repositories(first: 100, isArchived: false, after: $nextCursor) {
        nodes {
          nameWithOwner
          sshUrl
          isFork
          isTemplate
          parent {
            sshUrl
          }
        }
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }`,

  // https://docs.github.com/en/graphql/reference/queries#organization
  QUERY_ORG_REPOS: `query GetOrgRepos($username: String!, $nextCursor: String) {
    organization(login:$username) {
      repositories(first: 100, isArchived: false, after: $nextCursor) {
        nodes {
          nameWithOwner
          sshUrl
          isFork
          isTemplate
          parent {
            sshUrl
          }
        }
        totalCount
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  }`

};
