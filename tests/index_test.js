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
import maezato, {
  handleRepos, parseJson
} from '../index.js';

tape('several functions are exported', (test) => {
  test.plan(4);

  test.equal(typeof maezato, 'function');
  test.equal(maezato.length, 1, 'takes a single argument');
  test.equal(typeof parseJson, 'function');

  test.equal(typeof handleRepos, 'function');
});

tape('parseJson - parsing json', (test) => {
  test.plan(2);

  const data = parseJson('{"text": "Success"}');

  test.equal(data.text, 'Success');

  test.notOk(parseJson('-'));
});


// Mock console.error to verify error logging
const mockConsoleError = () => {
  const originalConsoleError = console.error;
  const errorMessages = [];
  console.error = (message) => errorMessages.push(message);

  return {
    errorMessages,
    restore: () => {
      console.error = originalConsoleError;
    }
  };
};

tape('parseJson - should parse valid JSON string', (t) => {
  const jsonString = '{"name": "John", "age": 30}';
  const expected = {
    name: 'John',
    age: 30
  };

  const result = parseJson(jsonString);

  t.deepEqual(result, expected, 'Should correctly parse a valid JSON string');
  t.end();
});

tape('parseJson - should return undefined for invalid JSON string', (t) => {
  const {
    errorMessages, restore
  } = mockConsoleError();
  const invalidJsonString = '{"name": "John", "age":}';

  const result = parseJson(invalidJsonString);

  t.equal(result, undefined, 'Should return undefined for invalid JSON');
  t.ok(
    errorMessages.some((msg) =>
      msg.includes('Parsing JSON failed')
    ),
    'Should log an error for invalid JSON'
  );

  restore();
  t.end();
});

tape('parseJson - should return undefined for empty string', (t) => {
  const {
    errorMessages, restore
  } = mockConsoleError();
  const emptyString = '';

  const result = parseJson(emptyString);

  t.equal(result, undefined, 'Should return undefined for empty string');
  t.ok(
    errorMessages.some((msg) =>
      msg.includes('Parsing JSON failed')
    ),
    'Should log an error for empty string'
  );

  restore();
  t.end();
});
