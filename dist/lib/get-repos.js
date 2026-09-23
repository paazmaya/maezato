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
/**
 * Performs a request via the graphql API
 * @param options Options for the request
 * @returns Promise that resolves to the repository nodes
 */
export const performRequest = (options) => {
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
        .then((response) => {
        const typedResponse = response;
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
export const handleList = (list) => {
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
const getRepos = (options, list = []) => {
    if (!options.query) {
        options.query = literals.QUERY_USER_REPOS;
    }
    if (options.username.startsWith("@")) {
        options.username = options.username.slice(1);
        options.query = literals.QUERY_ORG_REPOS;
    }
    if (options.verbose) {
        console.log(`Fetching information on user repositories for "${options.username}" with query "${options.query}"`);
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
const getReposWithPagination = (options, list) => {
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
        .then((response) => {
        const typedResponse = response;
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
//# sourceMappingURL=get-repos.js.map