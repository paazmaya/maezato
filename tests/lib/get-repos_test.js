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

import fs from 'fs';

import tape from 'tape';
import { graphql } from 'msw';
import { setupServer } from 'msw/node';

import getRepos from '../../lib/get-repos.js';
import literals from '../../lib/literals.js';

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

// Mock server that catches all GraphQL requests
const server = setupServer(
  graphql.operation((req, res, ctx) => {
    return res(
      ctx.data(response.data)
    )  
  })
);

tape('getRepos - stuff is fetched', (test) => {
  test.plan(1);
  //literals.GITHUB_API_URL
  server.listen();

  return getRepos({
    username: USERNAME,
    token: TOKEN,
    verbose: true
  }).then((output) => {
    test.equal(output.length, 66);
  }).catch((error) => {
    test.fail(error.message);
  }).finally(() => {
    server.close();
  });
});
