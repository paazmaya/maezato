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

import path from "node:path";
import { exec } from "node:child_process";

import { mkdirp } from "mkdirp";

import addRemote from "./add-remote.ts";
import literals from "./literals.ts";

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

export interface ProgressBar {
  tick: () => void;
  render: () => void;
}

/**
 * Determine repository type based on its properties
 *
 * @param item Repository item
 * @param options Options containing username
 * @returns Repository type: templates, fork, mine, or contributing
 */
const getRepositoryType = (item: RepositoryItem, options: Options): string => {
  if (item.template) {
    return "templates";
  }
  if (item.fork) {
    return "fork";
  }
  if (item.owner === options.username) {
    return "mine";
  }

  return "contributing";
};

/**
 * Build the clone path for the repository
 *
 * @param type Repository type
 * @param options Options for building path
 * @returns The full clone path
 */
const buildClonePath = (type: string, options: Options): string => {
  return options.omitUsername
    ? path.join(options.cloneBaseDir, type)
    : path.join(options.cloneBaseDir, options.username, type);
};

/**
 * Build git clone command
 *
 * @param sshUrl SSH URL of the repository
 * @returns Git clone command
 */
const buildGitCloneCommand = (sshUrl: string): string => {
  return `git clone ${sshUrl}`;
};

/**
 * Build exec options for running git clone
 *
 * @param clonePath Path where to clone
 * @returns Exec options
 */
const buildExecOptions = (
  clonePath: string,
): { cwd: string; env: NodeJS.ProcessEnv; encoding: BufferEncoding } => {
  return {
    cwd: clonePath,
    env: process.env,
    encoding: "utf8",
  };
};

/**
 * Handle exec callback for git clone
 *
 * @param error Error object if command failed
 * @param stdout Standard output
 * @param stderr Standard error output
 * @param sshUrl SSH URL for error message
 * @param fulfill Promise fulfill function
 * @param reject Promise reject function
 */
const handleExecCallback = (
  error: Error | null,
  stdout: string,
  stderr: string,
  sshUrl: string,
  fulfill: (value?: void) => void,
  reject: (reason?: unknown) => void,
): void => {
  // TODO: how about terminals with other languages than english?
  if (
    error &&
    stderr.indexOf("already exists and is not an empty directory") === literals.INDEX_NOT_FOUND
  ) {
    console.error(`Failed to clone "${sshUrl}"`);
    reject(error);
  } else {
    fulfill();
  }
};

/**
 * Execute git clone command in the specified directory
 *
 * @param sshUrl SSH URL of the repository
 * @param clonePath Path where to clone
 * @param options Options for execution
 * @returns Promise that resolves when clone completes
 */
const executeGitClone = (sshUrl: string, clonePath: string, options: Options): Promise<void> => {
  const command = buildGitCloneCommand(sshUrl);
  const opts = buildExecOptions(clonePath);

  if (options.verbose) {
    console.log(`Cloning repository ${sshUrl}`);
  }

  return new Promise((fulfill, reject) => {
    exec(command, opts, (error: Error | null, stdout: string, stderr: string) => {
      handleExecCallback(error, stdout, stderr, sshUrl, fulfill, reject);
    });
  });
};

/**
 * Add upstream remote for fork repositories
 *
 * @param data Repository data
 * @param clonePath Path where repository was cloned
 * @param options Options for execution
 * @returns Promise that resolves when remote is added
 */
const handleForkRemote = (
  data: RepositoryItem,
  clonePath: string,
  options: Options,
): Promise<void> => {
  const forkPath = path.join(clonePath, data.name || "");

  return addRemote(data, forkPath, "upstream", data.parent?.ssh_url || "", options).then(() => {
    // Ignore the returned item, we just need the promise to resolve
  });
};

/**
 * Clone a repository
 *
 * @param item Meta data for the given repository
 * @param progressBar Instance of Progress bar
 * @param options Options for cloning
 * @returns Promise that resolves when git has cloned
 */
const cloneRepo = (
  item: RepositoryItem,
  progressBar: ProgressBar,
  options: Options,
): Promise<void> => {
  const type = getRepositoryType(item, options);
  const clonePath = buildClonePath(type, options);

  mkdirp.sync(clonePath);

  return executeGitClone(item.ssh_url || "", clonePath, options)
    .then(() => {
      if (!options.verbose) {
        progressBar.tick();
        progressBar.render();
      }

      if (item.fork) {
        return handleForkRemote(item, clonePath, options);
      }

      return Promise.resolve();
    })
    .then(() => {
      if (!options.verbose) {
        progressBar.tick();
        progressBar.render();
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

export default cloneRepo;
export {
  getRepositoryType,
  buildClonePath,
  buildGitCloneCommand,
  buildExecOptions,
  handleExecCallback,
  executeGitClone,
  handleForkRemote,
};
