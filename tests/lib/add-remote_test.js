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

const tape = require('tape'),
  addRemote = require('../../lib/add-remote');

tape('addRemote - token gets used', (test) => {
  test.plan(1);

  const output = addRemote('1', '2', '3', '3', {
    verbose: true
  });

  test.equal(output, 'token hoplaa');
});
