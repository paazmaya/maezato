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
import {
  setupServer
} from 'msw/node';

import getRepos, {
  performRequest, handleList
} from '../../lib/get-repos.js';
import literals from '../../lib/literals.js';

import {
  handlers
} from './mock-handler.js';

const server = setupServer(...handlers);

tape('getRepos - exposes function', (test) => {
  test.plan(2);

  test.equal(typeof getRepos, 'function');
  test.equal(getRepos.length, 1, 'takes one argument');
});

tape('performRequest - valid request', async (test) => {
  test.plan(2);
  server.listen();

  const options = {
    username: 'testuser',
    token: 'valid-token',
    query: literals.QUERY_USER_REPOS
  };
  const response = await performRequest(options);
  test.equal(response.nodes.length, 38);

  try {
    test.deepEqual(
      response.nodes[0],
      {
        nameWithOwner: 'paazmaya/renshuu.paazmaya.fi',
        sshUrl: 'git@github.com:paazmaya/renshuu.paazmaya.fi.git',
        isFork: false,
        parent: null,
        isTemplate: false
      },
      'Should return the correct repository nodes'
    );
  }
  catch {
    test.fail('Should not throw an error for valid request');
  }
  finally {
    server.close();
  }
});

tape('performRequest - invalid token', async (test) => {
  test.plan(1);
  server.listen();

  const options = {
    username: 'testuser',
    token: 'invalid-token',
    query: literals.QUERY_USER_REPOS
  };

  try {
    await performRequest(options);
    test.fail('Should throw an error for invalid token');
  }
  catch (err) {
    test.equal(err.message, 'Bad credentials', 'Should return a "Bad credentials" error');
  }
  finally {
    server.close();
  }
});

tape('handleList - transform repository list', (test) => {
  test.plan(1);
  const list = [
    {
      nameWithOwner: 'owner/repo1',
      isFork: false,
      isTemplate: false,
      sshUrl: 'ssh://repo1',
      parent: null
    },
    {
      nameWithOwner: 'owner/repo2',
      isFork: true,
      isTemplate: false,
      sshUrl: 'ssh://repo2',
      parent: {
        sshUrl: 'ssh://parent-repo2'
      }
    }
  ];

  const result = handleList(list);

  test.deepEqual(
    result,
    [
      {
        fork: false,
        template: false,
        owner: 'owner',
        name: 'repo1',
        ssh_url: 'ssh://repo1',
        parent: {
          ssh_url: null
        }
      },
      {
        fork: true,
        template: false,
        owner: 'owner',
        name: 'repo2',
        ssh_url: 'ssh://repo2',
        parent: {
          ssh_url: 'ssh://parent-repo2'
        }
      }
    ],
    'Should transform the repository list correctly'
  );
});

tape('getRepos - fetch repositories', async (test) => {
  test.plan(1);
  server.listen();

  const options = {
    username: 'testuser',
    token: 'valid-token',
    verbose: false
  };
  const result = await getRepos(options);

  try {

    test.deepEqual(
      result[0],

      {
        fork: false,
        template: false,
        owner: 'paazmaya',
        name: 'renshuu.paazmaya.fi',
        ssh_url: 'git@github.com:paazmaya/renshuu.paazmaya.fi.git',
        parent: {
          ssh_url: null
        }
      }
      ,
      'Should fetch and transform repository data'
    );
  }
  catch {
    test.fail('Should not throw an error for valid request');
  }
  finally {
    server.close();
  }

});

tape('getRepos - verbose output', async (test) => {
  test.plan(1);
  server.listen();

  const options = {
    username: 'testuser',
    token: 'valid-token',
    verbose: true
  };

  const originalLog = console.log;
  let logOutput = '';
  console.log = (message) => {
    logOutput += message;
  };

  try {
    await getRepos(options);
    test.ok(logOutput.includes('Fetching information on user repositories for "testuser"'), 'Should log verbose output');
  }
  catch {
    test.fail('Should not throw an error for valid request');
  }
  finally {
    console.log = originalLog;
    server.close();
  }
});

tape('getRepos - organization repositories with @ prefix', async (test) => {
  test.plan(2);
  server.listen();

  const options = {
    username: '@testorg',
    token: 'valid-token',
    verbose: false
  };
  const result = await getRepos(options);

  try {
    test.equal(options.username, 'testorg', 'Should strip @ prefix from organization name');
    test.equal(result[0].owner, 'paazmaya', 'Should fetch organization repositories');
  }
  catch {
    test.fail('Should not throw an error for organization request');
  }
  finally {
    server.close();
  }
});

tape('getRepos - initializes query if not provided', async (test) => {
  test.plan(1);
  server.listen();

  const options = {
    username: 'testuser',
    token: 'valid-token',
    verbose: false
  };

  try {
    await getRepos(options);
    test.ok(options.query, 'Should initialize query option if not provided');
  }
  catch {
    test.fail('Should not throw an error');
  }
  finally {
    server.close();
  }
});

