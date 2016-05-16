#!/usr/bin/env node

/**
 * maezato
 * https://github.com/paazmaya/maezato
 *
 * Clone all repositories of a given user at GitHub,
 * by ordering them according to fork/contributing/mine
 * @see https://developer.github.com/v3/repos/#list-user-repositories
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (http://paazmaya.fi)
 * Licensed under the MIT license
 */

'use strict';

const fs = require('fs'),
  path = require('path');

const optionator = require('optionator');

const maezato = require('../index');

const pjson = fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'),
  pkg = maezato.parseJson(pjson);

const optsParser = optionator({
  prepend: `Usage: ${pkg.name} [options] <username> <directory>`,
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
      option: 'save-json',
      alias: 's',
      type: 'Boolean',
      description: 'Save API calls as JSON files, possibly for debugging'
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

if (opts._.length !== 2) {
  console.log('Seem to be missing <username> or <target path> hence exiting');
  process.exit(1);
}

const token = opts.token || process.env.GITHUB_TOKEN;

if (!token) {
  console.log('GitHub authentication token missing');
  console.log('Please set it via GITHUB_TOKEN environment variable or --token option');
  process.exit(1);
}

maezato({
  token: token,
  verbose: typeof opts.verbose === 'boolean' ? opts.verbose : false,
  saveJson: typeof opts.saveJson === 'boolean' ? opts.saveJson : false,
  username: opts._[0],
  cloneBaseDir: path.resolve(opts._[1])
});
