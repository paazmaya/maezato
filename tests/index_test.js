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

import tape from 'tape';
import maezato, {cloneRepo, handleRepos, parseJson} from '../index.js';

tape('several functions are exported', (test) => {
  test.plan(5);

  test.equal(typeof maezato, 'function');
  test.equal(maezato.length, 1, 'takes a single argument');
  test.equal(typeof parseJson, 'function');

  test.equal(typeof cloneRepo, 'function');
  test.equal(typeof handleRepos, 'function');
});

tape('parsing json', (test) => {
  test.plan(2);

  const data = parseJson('{"text": "Success"}');

  test.equal(data.text, 'Success');

  test.notOk(parseJson('-'));
});
