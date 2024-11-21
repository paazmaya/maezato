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

import addRemote from '../../lib/add-remote.js';

tape('addRemote - exposes function', (test) => {
  test.plan(2);

  test.equal(typeof addRemote, 'function');
  test.equal(addRemote.length, 5, 'takes FIVE arguments');
});

tape('addRemote - adding remote hoplaa to a non-existing project', (test) => {
  test.plan(1);

  addRemote({}, 'fork cloned somewhere here', 'hoplaa', 'git:////////hoplaa', {
    verbose: true
  }).then().catch(() => {
    test.ok('failed as expected');
  }).catch((error) => {
    test.fail(error.message);
  });

});
