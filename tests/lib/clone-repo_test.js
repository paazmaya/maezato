import tape from 'tape';
import path from 'node:path';
import {
  getRepositoryType,
  buildClonePath,
  buildGitCloneCommand,
  buildExecOptions,
  handleExecCallback
} from '../../lib/clone-repo.js';

/**
 * Tests for getRepositoryType
 */
tape('getRepositoryType - template repository', (test) => {
  test.plan(1);

  const item = {
    template: true,
    fork: false,
    owner: 'user'
  };
  const options = {
    username: 'user'
  };

  const result = getRepositoryType(item, options);
  test.equal(result, 'templates', 'Should return "templates" for template repositories');
});

tape('getRepositoryType - fork repository', (test) => {
  test.plan(1);

  const item = {
    template: false,
    fork: true,
    owner: 'other-user'
  };
  const options = {
    username: 'user'
  };

  const result = getRepositoryType(item, options);
  test.equal(result, 'fork', 'Should return "fork" for forked repositories');
});

tape('getRepositoryType - own repository', (test) => {
  test.plan(1);

  const item = {
    template: false,
    fork: false,
    owner: 'user'
  };
  const options = {
    username: 'user'
  };

  const result = getRepositoryType(item, options);
  test.equal(result, 'mine', 'Should return "mine" for own repositories');
});

tape('getRepositoryType - contributing repository', (test) => {
  test.plan(1);

  const item = {
    template: false,
    fork: false,
    owner: 'other-user'
  };
  const options = {
    username: 'user'
  };

  const result = getRepositoryType(item, options);
  test.equal(result, 'contributing', 'Should return "contributing" for repositories of other users');
});

tape('getRepositoryType - template takes precedence over fork', (test) => {
  test.plan(1);

  const item = {
    template: true,
    fork: true,
    owner: 'user'
  };
  const options = {
    username: 'user'
  };

  const result = getRepositoryType(item, options);
  test.equal(result, 'templates', 'Template should take precedence over fork');
});

/**
 * Tests for buildClonePath
 */
tape('buildClonePath - with username in path', (test) => {
  test.plan(1);

  const type = 'mine';
  const options = {
    omitUsername: false,
    username: 'testuser',
    cloneBaseDir: '/base/dir'
  };

  const result = buildClonePath(type, options);
  const expected = path.join('/base/dir', 'testuser', 'mine');

  test.equal(result, expected, 'Should build path with username');
});

tape('buildClonePath - without username in path', (test) => {
  test.plan(1);

  const type = 'fork';
  const options = {
    omitUsername: true,
    username: 'testuser',
    cloneBaseDir: '/base/dir'
  };

  const result = buildClonePath(type, options);
  const expected = path.join('/base/dir', 'fork');

  test.equal(result, expected, 'Should build path without username when omitUsername is true');
});

tape('buildClonePath - for templates type', (test) => {
  test.plan(1);

  const type = 'templates';
  const options = {
    omitUsername: false,
    username: 'testuser',
    cloneBaseDir: '/home/user'
  };

  const result = buildClonePath(type, options);
  const expected = path.join('/home/user', 'testuser', 'templates');

  test.equal(result, expected, 'Should build path for templates type');
});

tape('buildClonePath - for contributing type', (test) => {
  test.plan(1);

  const type = 'contributing';
  const options = {
    omitUsername: false,
    username: 'testuser',
    cloneBaseDir: '/repos'
  };

  const result = buildClonePath(type, options);
  const expected = path.join('/repos', 'testuser', 'contributing');

  test.equal(result, expected, 'Should build path for contributing type');
});

/**
 * Tests for buildGitCloneCommand
 */
tape('buildGitCloneCommand - constructs command with SSH URL', (test) => {
  test.plan(1);

  const sshUrl = 'git@github.com:user/repo.git';
  const result = buildGitCloneCommand(sshUrl);
  const expected = 'git clone git@github.com:user/repo.git';

  test.equal(result, expected, 'Should construct git clone command');
});

tape('buildGitCloneCommand - handles different URL formats', (test) => {
  test.plan(2);

  const sshUrl1 = 'git@github.com:org/project.git';
  const result1 = buildGitCloneCommand(sshUrl1);
  test.ok(result1.startsWith('git clone'), 'Command should start with git clone');
  test.ok(result1.includes(sshUrl1), 'Command should include the SSH URL');
});

/**
 * Tests for buildExecOptions
 */
tape('buildExecOptions - creates options with correct properties', (test) => {
  test.plan(4);

  const clonePath = '/path/to/clone';
  const result = buildExecOptions(clonePath);

  test.equal(result.cwd, clonePath, 'Should set cwd to clonePath');
  test.equal(result.env, process.env, 'Should set env to process.env');
  test.equal(result.encoding, 'utf8', 'Should set encoding to utf8');
  test.ok(result.cwd && result.env && result.encoding, 'Should have all required properties');
});

/**
 * Tests for handleExecCallback
 */
tape('handleExecCallback - fulfills on success', (test) => {
  test.plan(1);

  let fulfilled = false;
  const fulfill = () => {
    fulfilled = true;
  };
  const reject = () => {};

  handleExecCallback(null, '', '', 'git@test.git', fulfill, reject);

  test.ok(fulfilled, 'Should call fulfill on successful execution');
});

tape('handleExecCallback - rejects on error not about existing directory', (test) => {
  test.plan(1);

  let rejected = false;
  const fulfill = () => {};
  const reject = () => {
    rejected = true;
  };

  const error = new Error('Some git error');
  handleExecCallback(error, '', 'fatal: unable to create directory', 'git@test.git', fulfill, reject);

  test.ok(rejected, 'Should call reject on git clone error');
});

tape('handleExecCallback - fulfills on already exists error', (test) => {
  test.plan(1);

  let fulfilled = false;
  const fulfill = () => {
    fulfilled = true;
  };
  const reject = () => {};

  const error = new Error('Directory exists');
  handleExecCallback(error, '', 'already exists and is not an empty directory', 'git@test.git', fulfill, reject);

  test.ok(fulfilled, 'Should fulfill when directory already exists');
});
