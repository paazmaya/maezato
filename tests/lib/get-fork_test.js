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

const fs = require('fs');

const tape = require('tape'),
  nock = require('nock');

const getFork = require('../../lib/get-fork'),
  literals = require('../../lib/literals');

const payload = fs.readFileSync('tests/fixtures/repos-tonttu-takka.json', 'utf8');

tape('getFork - gets the data from url', (test) => {
  test.plan(2);

  nock(literals.GITHUB_API_URL)
    .get('/repos/tonttu/takka')
    .reply(200, payload);

  getFork('tonttu', 'takka', {
    verbose: true,
    token: 'hoplaa'
  }).then((output) => {
    test.equal(output.name, 'takka');
    test.equal(output.git_url, 'git://github.com/tonttu/takka.git');
  });

});
