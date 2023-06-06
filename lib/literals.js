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

/* import PKG from '../package.json' assert { type: 'json' };*/
const packageFile = new URL('../package.json', import.meta.url);
const PKG = JSON.parse(fs.readFileSync(packageFile, 'utf8'));

export default {
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
          isArchived
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
