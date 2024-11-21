import tape from 'tape';
import { setupServer } from 'msw/node';
import { handlers } from './mock-handler.js';
import cloneRepo from '../../lib/clone-repo.js';

// Mock progress bar
const progressBarMock = {
  tick: () => {},
  render: () => {},
};

// Mock `mkdirp.sync`
const mkdirpMock = {
  sync: (dir) => dir, // Pretend the directory was created
};

// Mock `addRemote`
const addRemoteMock = (data, forkPath, remoteName, sshUrl, options) =>
  Promise.resolve(`${remoteName} added`);

// Mock `exec` to interact with our fake Git server
const execMock = (command, opts, callback) => {
  const sshUrl = command.split(' ')[2]; // Extract SSH URL from the command

  // Simulate an HTTP POST to the fake Git server
  fetch('https://fake-git-server/clone', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ssh_url: sshUrl }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (response.ok) callback(null, data.message, '');
      else callback(new Error(data.error), '', data.error);
    })
    .catch((err) => callback(err, '', err.message));
};

const server = setupServer(...handlers);
/*
tape('cloneRepo - successful clone for own repository', async (t) => {
  server.listen();

  const item = {
    ssh_url: 'git@github.com:user/repo.git',
    fork: false,
    owner: 'user',
    name: 'repo',
  };

  const options = {
    token: 'dummy-token',
    verbose: false,
    omitUsername: true,
    username: 'user',
    cloneBaseDir: '/base/dir',
  };

  try {
    const result = await cloneRepo(item, progressBarMock, options);
    t.deepEqual(result, item, 'Should return the original item after successful clone');
    t.end();
  } catch (err) {
    t.fail(`Should not throw an error: ${err.message}`);
    t.end();
  } finally {
    server.close();
  }
});
*/
/*
tape('cloneRepo - failed clone due to existing directory', async (t) => {
  server.listen();

  const item = {
    ssh_url: 'git@github.com:user/clone-error.git',
    fork: false,
    owner: 'user',
    name: 'error',
  };

  const options = {
    token: 'dummy-token',
    verbose: false,
    omitUsername: false,
    username: 'user',
    cloneBaseDir: '/base/dir',
  };

  try {
    await cloneRepo(item, progressBarMock, options);
    t.fail('Should throw an error for git clone failure');
    t.end();
  } catch (err) {
    t.equal(
      err.message,
      'Repository already exists and is not empty',
      'Should throw the correct error message'
    );
    t.end();
  } finally {
    server.close();
  }
});
*/