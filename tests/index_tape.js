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
  path = require('path');

const tape = require('tape'),
  maezato = require('../index');

tape('several functions are exported', (test) => {
  test.plan(10);

  test.equal(typeof maezato, 'function');
  test.equal(maezato.length, 1, 'takes a single argument');
  test.equal(typeof maezato.parseJson, 'function');
  test.equal(typeof maezato.saveJson, 'function');

  test.equal(typeof maezato._getGotOptions, 'function');
  test.equal(typeof maezato._getRepos, 'function');
  test.equal(typeof maezato._addRemote, 'function');
  test.equal(typeof maezato._getFork, 'function');
  test.equal(typeof maezato._cloneRepo, 'function');
  test.equal(typeof maezato._handleRepos, 'function');
});


tape('parsing json', (test) => {
  test.plan(2);

  const data = maezato.parseJson('{"text": "Success"}');

  test.equal(data.text, 'Success');

  test.notOk(maezato.parseJson('-'));
});

