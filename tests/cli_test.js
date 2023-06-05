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

import fs from 'fs';
import path from 'path';
import {
    execFile
} from 'child_process';

import tape from 'tape';

/* import pkg from '../package.json' assert { type: 'json' };*/
const packageFile = new URL('../package.json', import.meta.url);
const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));

tape('cli should output version number', (test) => {
  test.plan(1);

  execFile('node', [pkg.bin, '-V'], null, (error, stdout) => {
    if (error) {
      test.fail(error);
    }
    test.equals(stdout.trim(), pkg.version, 'Version is the same as in package.json');
  });

});

tape('cli should output help by default', (test) => {
  test.plan(2);

  execFile('node', [pkg.bin], null, (error, stdout) => {
    if (error) {
      test.ok('Exists with non-zero code');
    }
    test.ok(stdout.trim().indexOf('Usage: maezato [options] <username> <target path') !== -1, 'Help appeared');
  });

});

tape('cli should output help when requested', (test) => {
  test.plan(1);

  execFile('node', [pkg.bin, '--help'], null, (error, stdout) => {
    if (error) {
      test.fail(error);
    }
    test.ok(stdout.trim().indexOf('Usage: maezato [options] <username> <target path') !== -1, 'Help appeared');
  });

});
