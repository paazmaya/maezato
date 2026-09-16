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
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const packageFile = new URL('../package.json', import.meta.url);
const pkg = JSON.parse(fs.readFileSync(packageFile, 'utf8'));

const cliPath = pkg.bin.maezato;

describe('cli', () => {
  it('should output version number', () => {
    return new Promise<void>((resolve, reject) => {
      execFile('node', [cliPath, '-V'], null, (error, stdout) => {
        if (error) {
          reject(error);
        } else {
          expect(stdout.trim()).toBe(pkg.version);
          resolve();
        }
      });
    });
  });

  it('should output help by default', () => {
    return new Promise<void>((resolve, _reject) => {
      execFile('node', [cliPath], null, (error, stdout) => {
        expect(error).toBeTruthy();
        expect(stdout.trim().indexOf('Usage: maezato [options] <username | @organization> <target path')).not.toBe(-1);
        resolve();
      });
    });
  });

  it('should output help when requested', () => {
    return new Promise<void>((resolve, reject) => {
      execFile('node', [cliPath, '--help'], null, (error, stdout) => {
        if (error) {
          reject(error);
        } else {
          expect(stdout.trim().indexOf('Usage: maezato [options] <username | @organization> <target path')).not.toBe(-1);
          resolve();
        }
      });
    });
  });
});