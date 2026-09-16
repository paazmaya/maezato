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

import { describe, it, expect } from 'vitest';
import maezato, { handleRepos, parseJson } from '../dist/index.js';

describe('index', () => {
  it('several functions are exported', () => {
    expect(typeof maezato).toBe('function');
    expect(maezato.length).toBe(1);
    expect(typeof parseJson).toBe('function');
    expect(typeof handleRepos).toBe('function');
  });

  it('parseJson - parsing json', () => {
    const data = parseJson('{"text": "Success"}');
    expect(data).toEqual({ text: 'Success' });
    expect(parseJson('-')).toBeUndefined();
  });

  // Mock console.error to verify error logging
  const mockConsoleError = () => {
    const originalConsoleError = console.error;
    const errorMessages: string[] = [];
    console.error = (message: string) => errorMessages.push(message);

    return {
      errorMessages,
      restore: () => {
        console.error = originalConsoleError;
      }
    };
  };

  it('parseJson - should parse valid JSON string', () => {
    const jsonString = '{"name": "John", "age": 30}';
    const expected = { name: 'John', age: 30 };

    const result = parseJson(jsonString);

    expect(result).toEqual(expected);
  });

  it('parseJson - should return undefined for invalid JSON string', () => {
    const { errorMessages, restore } = mockConsoleError();
    const invalidJsonString = '{"name": "John", "age":}';

    const result = parseJson(invalidJsonString);

    expect(result).toBeUndefined();
    expect(errorMessages.some((msg) => msg.includes('Parsing JSON failed'))).toBe(true);

    restore();
  });

  it('parseJson - should return undefined for empty string', () => {
    const { errorMessages, restore } = mockConsoleError();
    const emptyString = '';

    const result = parseJson(emptyString);

    expect(result).toBeUndefined();
    expect(errorMessages.some((msg) => msg.includes('Parsing JSON failed'))).toBe(true);

    restore();
  });
});