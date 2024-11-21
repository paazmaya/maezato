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

import tape from 'tape';
import { setupServer } from 'msw/node';

import getRepos, { performRequest, handleList } from '../../lib/get-repos.js';
import literals from '../../lib/literals.js';

import { handlers } from './mock-handler.js';

const server = setupServer(...handlers);

tape('getRepos - exposes function', (test) => {
  test.plan(2);

  test.equal(typeof getRepos, 'function');
  test.equal(getRepos.length, 1, 'takes one argument');
});

const TOKEN = 'hoplaa';
const USERNAME = 'paazmaya';

tape('getRepos - stuff is fetched', (test) => {
  test.plan(1);
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


/*
tape('MSW + Tape: performRequest - valid request', async (t) => {
  server.listen(); // Start MSW

  const options = {
    username: 'testuser',
    token: 'valid-token',
    query: literals.QUERY_USER_REPOS,
  };

  try {
    const response = await performRequest(options);

    t.deepEqual(
      response.nodes,
      [
        {
          nameWithOwner: 'owner/repo1',
          isFork: false,
          isArchived: false,
          sshUrl: 'ssh://repo1',
          parent: null,
        },
      ],
      'Should return the correct repository nodes'
    );
  } catch (err) {
    t.fail('Should not throw an error for valid request');
  } finally {
    server.close(); // Stop MSW
    t.end();
  }
});

tape('MSW + Tape: performRequest - invalid token', async (t) => {
  server.listen(); // Start MSW

  const options = {
    username: 'testuser',
    token: 'invalid-token',
    query: literals.QUERY_USER_REPOS,
  };

  try {
    await performRequest(options);
    t.fail('Should throw an error for invalid token');
  } catch (err) {
    t.equal(err.message, 'Bad credentials - https://docs.github.com/graphql', 'Should return a "Bad credentials" error');
  } finally {
    server.close(); // Stop MSW
    t.end();
  }
});

tape('MSW + Tape: handleList - transform repository list', (t) => {
  const list = [
    {
      nameWithOwner: 'owner/repo1',
      isFork: false,
      isArchived: false,
      sshUrl: 'ssh://repo1',
      parent: null,
    },
    {
      nameWithOwner: 'owner/repo2',
      isFork: true,
      isArchived: false,
      sshUrl: 'ssh://repo2',
      parent: { sshUrl: 'ssh://parent-repo2' },
    },
  ];

  const result = handleList(list);

  t.deepEqual(
    result,
    [
      {
        fork: false,
        archived: false,
        owner: 'owner',
        name: 'repo1',
        ssh_url: 'ssh://repo1',
        parent: { ssh_url: null },
      },
      {
        fork: true,
        archived: false,
        owner: 'owner',
        name: 'repo2',
        ssh_url: 'ssh://repo2',
        parent: { ssh_url: 'ssh://parent-repo2' },
      },
    ],
    'Should transform the repository list correctly'
  );
  t.end();
});

tape('MSW + Tape: getRepos - fetch repositories', async (t) => {
  server.listen(); // Start MSW

  const options = {
    username: 'testuser',
    token: 'valid-token',
    verbose: false,
  };

  try {
    const result = await getRepos(options);

    t.deepEqual(
      result,
      [
        {
          fork: false,
          archived: false,
          owner: 'owner',
          name: 'repo1',
          ssh_url: 'ssh://repo1',
          parent: { ssh_url: null },
        },
      ],
      'Should fetch and transform repository data'
    );
  } catch (err) {
    t.fail('Should not throw an error for valid request');
  } finally {
    server.close(); // Stop MSW
    t.end();
  }
});
*/