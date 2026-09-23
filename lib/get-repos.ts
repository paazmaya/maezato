/**
 * maezato
 * https://github.com/paazmaya/maezato
 *
 * Clone all repositories of a given user or organization at GitHub,
 * by ordering them according to fork/contributing/mine
 *
 * Copyright (c) Juga Paazmaya <paazmaya@yahoo.com> (https://paazmaya.fi)
 * Author: Priyansh Jain <priyanshjain412@gmail.com>
 * Licensed under the MIT license
 */

import { graphql } from "@octokit/graphql";
import literals from "./literals.js";

export interface Options {
  token: string;
  verbose?: boolean;
  omitUsername?: boolean;
  username: string;
  cloneBaseDir: string;
  query?: string;
  nextCursor?: string | null;
}

export interface RepositoryNode {
  nameWithOwner: string;
  sshUrl: string;
  isFork: boolean;
  isTemplate: boolean;
  parent?: {
    sshUrl: string;
  };
}

export interface GraphQLResponse {
  nodes: RepositoryNode[];
  pageInfo: {
    hasNextPage: boolean;
    endCursor: string;
  };
  totalCount: number;
}

interface GraphQLResult {
  user?: { repositories?: GraphQLResponse };
  organization?: { repositories?: GraphQLResponse };
}

/**
 * Performs a request via the graphql API
 * @param options Options for the request
 * @returns Promise that resolves to the repository nodes
 */
export const performRequest = (options: Options): Promise<GraphQLResponse> => {
  const { username, token, nextCursor = null, query } = options;

  return graphql({
    query,
    username,
    nextCursor,
    headers: {
      authorization: `bearer ${token}`,
      "user-agent": literals.USER_AGENT,
    },
  })
    .then((response: unknown) => {
      const typedResponse = response as GraphQLResult;
      const repos = typedResponse.user?.repositories || typedResponse.organization?.repositories;
      return repos || { nodes: [], pageInfo: { hasNextPage: false, endCursor: "" }, totalCount: 0 };
    })
    .catch((error) => Promise.reject(error));
};

/**
 * Uses a map function to structure the object as per needs
 *
 * @param list List of all repositories
 * @returns Structured repository list
 */
export const handleList = (
  list: RepositoryNode[],
): Array<{
  fork: boolean;
  template: boolean;
  owner: string;
  name: string;
  ssh_url: string;
  parent: { ssh_url: string | null };
}> => {
  const repoList = list.map((repo) => {
    const [owner, repoName] = repo.nameWithOwner.split("/");

    return {
      fork: repo.isFork,
      template: repo.isTemplate,
      owner: owner,
      name: repoName,
      ssh_url: repo.sshUrl,
      parent: {
        ssh_url: repo.parent ? repo.parent.sshUrl : null,
      },
    };
  });

  return repoList;
};

/**
 * Get a list of repositories
 *
 * @param options Options for fetching repositories
 * @param list Accumulator for repository list
 * @returns Promise that resolves to the list of repositories
 */
const getRepos = (
  options: Options,
  list: RepositoryNode[] = [],
): Promise<
  Array<{
    fork: boolean;
    template: boolean;
    owner: string;
    name: string;
    ssh_url: string;
    parent: { ssh_url: string | null };
  }>
> => {
  if (!options.query) {
    options.query = literals.QUERY_USER_REPOS;
  }
  if (options.username.startsWith("@")) {
    options.username = options.username.slice(1);
    options.query = literals.QUERY_ORG_REPOS;
  }

  if (options.verbose) {
    console.log(
      `Fetching information on user repositories for "${options.username}" with query "${options.query}"`,
    );
  }

  return performRequest(options)
    .then((response) => {
      list.push(...response.nodes);
      if (!response.pageInfo.hasNextPage) {
        return handleList(list);
      }
      options.nextCursor = response.pageInfo.endCursor;

      return getReposWithPagination(options, list);
    })
    .catch((err) => Promise.reject(err));
};

const getReposWithPagination = (
  options: Options,
  list: RepositoryNode[],
): Promise<
  Array<{
    fork: boolean;
    template: boolean;
    owner: string;
    name: string;
    ssh_url: string;
    parent: { ssh_url: string | null };
  }>
> => {
  const { username, token, nextCursor = null } = options;

  return graphql({
    query: options.query || literals.QUERY_USER_REPOS,
    username,
    nextCursor,
    headers: {
      authorization: `bearer ${token}`,
      "user-agent": literals.USER_AGENT,
    },
  })
    .then((response: unknown) => {
      const typedResponse = response as GraphQLResult;
      const repos = typedResponse.user?.repositories || typedResponse.organization?.repositories;

      if (!repos) {
        return handleList(list);
      }

      list.push(...repos.nodes);

      if (!repos.pageInfo.hasNextPage) {
        return handleList(list);
      }

      options.nextCursor = repos.pageInfo.endCursor;

      return getReposWithPagination(options, list);
    })
    .catch((err) => Promise.reject(err));
};

export default getRepos;
