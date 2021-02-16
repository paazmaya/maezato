/**
 * maezato
 * https://github.com/paazmaya/maezato
 *
 * Clone all repositories of a given user at GitHub,
 * by ordering them according to fork/contributing/mine
 * @see https://developer.github.com/v4/object/repository/
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (https://paazmaya.fi)
 * Author: Priyansh Jain <priyanshjain412@gmail.com>
 * Licensed under the MIT license
 */

const fs = require('fs');

const tape = require('tape');
const nock = require('nock');

const getRepos = require('../../lib/get-repos');
const literals = require('../../lib/literals');

const payload = fs.readFileSync('tests/fixtures/users-paazmaya-repos.json', 'utf8');
const response = JSON.parse(payload);

tape('getRepos - exposes function', (test) => {
  test.plan(2);

  test.equal(typeof getRepos, 'function');
  test.equal(getRepos.length, 1, 'takes one argument');
});

// const TOKEN = '<INSERT YOUR TOKEN HERE>';
const TOKEN = 'hoplaa';
const USERNAME = 'paazmaya';

tape('getRepos - stuff is fetched', (test) => {
  test.plan(1);
  /**
   * Had to comment this part for the tests to run
   */
  const scope = nock(literals.GITHUB_API_URL)
    .post('/graphql')
    .reply(200, response);

  getRepos({
    username: USERNAME,
    token: TOKEN,
    verbose: true
  }).then((output) => {
    test.equal(output.length, 66);
    scope.done();
  }).catch((error) => {
    test.fail(error.message);
  });
});
