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

const getReposGraphQL = require('../../lib/get-repos-graphql');
const literals = require('../../lib/literals');

const payload = fs.readFileSync('tests/fixtures/users-paazmaya-repos-gql.json', 'utf8');
const response = JSON.parse(payload);

tape('getReposGraphQL - exposes function', (test) => {
  test.plan(2);

  test.equal(typeof getReposGraphQL, 'function');
  test.equal(getReposGraphQL.length, 1, 'takes one argument');
});

// const TOKEN = '<INSERT YOUR TOKEN HERE>';
const TOKEN = 'hoplaa';
const USERNAME = 'paazmaya';

tape('getReposGraphQL - stuff is fetched', (test) => {
  test.plan(1);
  /**
   * Had to comment this part for the tests to run
   */
  const scope = nock(literals.GITHUB_API_URL)
    .post('/graphql')
    .reply(200, response);

  getReposGraphQL({
    username: USERNAME,
    token: TOKEN,
    verbose: true
  }).then((output) => {
    test.equal(output.length, 14);
    scope.done();
  }).catch((error) => {
    test.fail(error.message);
  });
});
