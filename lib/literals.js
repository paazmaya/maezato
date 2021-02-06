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

const PKG = require('../package.json');

module.exports = {
  GITHUB_API_URL: 'https://api.github.com',
  INDEX_NOT_FOUND: -1,
  USER_AGENT: 'https://github.com/paazmaya/maezato v' + PKG.version,

  // https://developer.github.com/v4/object/user/
  // https://developer.github.com/v4/object/repository/
  QUERY_WITH_PAGINATION: `query GetUserRepos($username: String!, $nextCursor: String) {
    user(login:$username) {
      repositories(first: 100, after: $nextCursor) {
        nodes {
          nameWithOwner
          sshUrl
          isFork
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
