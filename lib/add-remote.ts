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

import { exec } from "node:child_process";

import literals from "./literals.ts";

export interface Options {
  token: string;
  verbose?: boolean;
  omitUsername?: boolean;
  username: string;
  cloneBaseDir: string;
}

export interface RepositoryItem {
  name?: string;
  parent?: {
    ssh_url?: string | null;
  };
}

/**
 * Item is passed on success
 *
 * @param item Meta data for the given repository
 * @param forkPath File path where the repository has been cloned
 * @param name Remote name
 * @param url Remote URL
 * @param options Options for execution
 * @returns Promise that resolves when git remote has been added
 */
const addRemote = (
  item: RepositoryItem,
  forkPath: string,
  name: string,
  url: string,
  options: Options,
): Promise<RepositoryItem> => {
  const command = `git remote add ${name} ${url}`;
  const opts = {
    cwd: forkPath,
    env: process.env,
    encoding: "utf8",
  };

  if (options.verbose) {
    console.log(`Adding remote information "${name}" = "${url}"`);
  }

  return new Promise((fulfill, reject) => {
    exec(command, opts, (error, _stdout, stderr) => {
      if (error && stderr.indexOf(`remote ${name} already exists`) === literals.INDEX_NOT_FOUND) {
        console.error(`Adding remote "${name}" failed for "${url}"`);
        console.error(stderr);
        reject(error);
      } else {
        fulfill(item);
      }
    });
  });
};

export default addRemote;
