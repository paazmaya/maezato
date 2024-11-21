#!/usr/bin/env node

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

import fs from 'node:fs';
import path from 'node:path';

import optionator from 'optionator';

import maezato from '../index.js';

/* import pkg from '../package.json' assert { type: 'json' };*/
const packageFile = new URL('../package.json', import.meta.url);
const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));

const optsParser = optionator({
  prepend: `Usage: ${pkg.name} [options] <username | @organization> <target path, defaults to current directory>`,
  append: `Version ${pkg.version}`,
  options: [
    {
      option: 'help',
      alias: 'h',
      type: 'Boolean',
      description: 'Help and usage instructions'
    },
    {
      option: 'version',
      alias: 'V',
      type: 'Boolean',
      description: 'Version number',
      example: '-V'
    },
    {
      option: 'verbose',
      alias: 'v',
      type: 'Boolean',
      description: 'Verbose output, will print which file is currently being processed'
    },
    {
      option: 'token',
      alias: 't',
      type: 'String',
      description: 'GitHub API personal authentication token'
    },
    {
      option: 'include-archived',
      alias: 'a',
      type: 'Boolean',
      description: 'Include also repositories that have been archived'
    },
    {
      option: 'omit-username',
      alias: 'O',
      type: 'Boolean',
      description: 'Omit the username directory when creating directory structure'
    }/* ,
   {
      option: 'exclude',
      alias: 'x',
      type: 'String',
      description: 'Exclude certain type of repositories, [fork]'
    }
    */
  ]
});


let opts;

try {
  opts = optsParser.parse(process.argv);
}
catch (error) {
  console.error(error.message);
  process.exit(1);
}

if (opts.version) {
  console.log(pkg.version);
  process.exit(0);
}

console.log(`${pkg.name} - ${pkg.description}`);

if (opts.help) {
  console.log(optsParser.generateHelp());
  process.exit(0);
}

if (opts._.length !== 1 && opts._.length !== 2) {
  console.log('Seem to be missing <username | @organization> or <target path>');
  console.log(optsParser.generateHelp());
  process.exit(1);
}

// Default path shall be current working directory
if (opts._.length === 1) {
  opts._.push('.');
}

const token = opts.token || process.env.GITHUB_TOKEN;

if (!token) {
  console.log('GitHub authentication token missing');
  console.log('Please set it via GITHUB_TOKEN environment variable or --token option');
  process.exit(1);
}

maezato({
  token: token,
  verbose: typeof opts.verbose === 'boolean' ?
    opts.verbose :
    false,
  includeArchived: typeof opts.includeArchived === 'boolean' ?
    opts.includeArchived :
    false,
  omitUsername: typeof opts.omitUsername === 'boolean' ?
    opts.omitUsername :
    false,
  username: opts._[0],
  cloneBaseDir: path.resolve(opts._[1])
});
