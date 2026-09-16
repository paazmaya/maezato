/**
 * maezato
 * https://github.com/paazmaya/maezato
 *
 * Clone all repositories of a given user or organization at GitHub,
 * by ordering them according to fork/contributing/mine
 * @see https://developer.github.com/v3/repos/#list-user-repositories
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (https://paazmaya.fi)
 * Licensed under the MIT license
 */

import each from 'promise-each';
import Progress from 'progress';

import getRepos from './lib/get-repos.js';
import cloneRepo from './lib/clone-repo.js';

export interface Options {
  token: string;
  verbose?: boolean;
  omitUsername?: boolean;
  includeArchived?: boolean;
  username: string;
  cloneBaseDir: string;
}

export interface RepositoryItem {
  archived?: boolean;
  fork?: boolean;
  template?: boolean;
  owner?: string;
  name?: string;
  ssh_url?: string;
  parent?: {
    ssh_url?: string | null;
  };
}

/**
 * Safe parsing JSON
 *
 * @param text JSON string
 * @returns Data object or undefined if parsing failed
 */
export const parseJson = (text: string): object | undefined => {
  let data: object | undefined;

  try {
    data = JSON.parse(text);
  } catch (error) {
    console.error(` Parsing JSON failed. ${error}`);
  }

  return data;
};

/**
 * Process a list of repositories
 *
 * @param list List of repositories for the given user
 * @param options Options for processing
 * @returns Promise that resolves when all repositories are processed
 */
export const handleRepos = (list: RepositoryItem[], options: Options): Promise<void> => {
  if (!options.includeArchived) {
    list = list.filter((item) => !item.archived);
  }

  // Show command line progress.
  const progressBar = new Progress(`Processing ${list.length} repositories [:bar] :percent`, {
    total: list.length * 2,
    complete: '#',
    incomplete: '-'
  });

  const promise = each(list, (item: RepositoryItem) => cloneRepo(item, progressBar, options));
  return promise.then(() => undefined);
};

/**
 * Executioner
 *
 * @param options Options for execution
 * @returns void
 */
const run = (options: Options): void => {
  console.log(`Cloning to a structure under "${options.cloneBaseDir}"`);

  // mkdirp.sync(options.cloneBaseDir);

  getRepos(options)
    .then((data) => handleRepos(data, options))
    .then(() => {
      console.log('All done, thank you!');
    })
    .catch((error) => {
      console.error('Something failed here.');
      if (options.verbose) {
        console.error(error);
      }
    });
};

export default run;