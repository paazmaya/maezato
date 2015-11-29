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

const tape = require('tape'),
  maezato = require('../index');

tape('several functions are exported', (test) => {
  test.plan(3);

  test.equal(typeof maezato.run, 'function');
  test.equal(typeof maezato.parseJson, 'function');
  test.equal(typeof maezato.saveJson, 'function');
});


tape('parsing json', (test) => {
  test.plan(2);

  const data = maezato.parseJson('{"text": "Success"}');
  test.equal(data.text, 'Success');

  test.notOk(maezato.parseJson('-'));
});



