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

const fs = require('fs'),
  path = require('path'),
  execFile = require('child_process').execFile;

const tape = require('tape');

const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));

tape('cli should output version number', (test) => {
  test.plan(1);

  execFile('node', [pkg.bin, '-V'], null, (err, stdout) => {
    test.equals(stdout.trim(), pkg.version, 'Version is the same as in package.json');
  });

});

tape('cli should output help by default', (test) => {
  test.plan(1);

  execFile('node', [pkg.bin], null, (err, stdout) => {
    test.ok(stdout.trim().indexOf('Usage: maezato [options] <username> <directory>') !== -1, 'Help appeared');
  });

});

tape('cli should output help when requested', (test) => {
  test.plan(1);

  execFile('node', [pkg.bin, '--help'], null, (err, stdout) => {
    test.ok(stdout.trim().indexOf('Usage: maezato [options] <username> <directory>') !== -1, 'Help appeared');
  });

});

