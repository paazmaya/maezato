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

const fs = require('fs');

const tape = require('tape'),
  nock = require('nock');

const getRepos = require('../../lib/get-repos');

const payload = fs.readFileSync('tests/fixtures/users-tonttu-repos.json', 'utf8');

tape('getRepos - stuff is fetched', (test) => {
  test.plan(1);

  nock('https://api.github.com')
    .get('/users/tonttu/repos')
    .query({
      type: 'all',
      per_page: '100'
    })
    .reply(200, payload);

  getRepos({
    username: 'tonttu',
    token: 'hoplaa',
    verbose: true
  }).then((output) => {
    test.equal(output.length, 3);
  });
});
