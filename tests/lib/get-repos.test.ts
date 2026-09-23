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

import { describe, it, expect, vi } from "vitest";
import fs from "node:fs";

// Mock @octokit/graphql before importing the module
const fixturePayload = fs.readFileSync(
  new URL("../fixtures/users-paazmaya-repos.json", import.meta.url),
  "utf8",
);
const fixtureResponse = JSON.parse(fixturePayload);

vi.mock("@octokit/graphql", () => ({
  graphql: vi.fn().mockImplementation(({ headers }) => {
    const authHeader = headers?.authorization || "";

    if (authHeader.includes("bearer valid-token")) {
      return Promise.resolve(fixtureResponse);
    } else if (authHeader.includes("bearer invalid-token")) {
      return Promise.reject(new Error("Bad credentials"));
    }

    return Promise.reject(new Error("Bad credentials"));
  }),
}));

import getRepos, { performRequest, handleList } from "../../lib/get-repos.ts";
import literals from "../../lib/literals.ts";

describe("get-repos", () => {
  it("exposes function", () => {
    expect(typeof getRepos).toBe("function");
    expect(getRepos.length).toBe(1);
  });

  it("performRequest - valid request", async () => {
    const options = {
      username: "testuser",
      token: "valid-token",
      query: literals.QUERY_USER_REPOS,
    };
    const response = await performRequest(options);
    expect(response.nodes.length).toBe(38);

    expect(response.nodes[0]).toEqual({
      nameWithOwner: "paazmaya/renshuu.paazmaya.fi",
      sshUrl: "git@github.com:paazmaya/renshuu.paazmaya.fi.git",
      isFork: false,
      parent: null,
      isTemplate: false,
    });
  });

  it("performRequest - invalid token", async () => {
    const options = {
      username: "testuser",
      token: "invalid-token",
      query: literals.QUERY_USER_REPOS,
    };

    try {
      await performRequest(options);
      expect.fail("Should throw an error for invalid token");
    } catch (err) {
      expect(err.message).toBe("Bad credentials");
    }
  });

  it("handleList - transform repository list", () => {
    const list = [
      {
        nameWithOwner: "owner/repo1",
        isFork: false,
        isTemplate: false,
        sshUrl: "ssh://repo1",
        parent: null,
      },
      {
        nameWithOwner: "owner/repo2",
        isFork: true,
        isTemplate: false,
        sshUrl: "ssh://repo2",
        parent: {
          sshUrl: "ssh://parent-repo2",
        },
      },
    ];

    const result = handleList(list);

    expect(result).toEqual([
      {
        fork: false,
        template: false,
        owner: "owner",
        name: "repo1",
        ssh_url: "ssh://repo1",
        parent: {
          ssh_url: null,
        },
      },
      {
        fork: true,
        template: false,
        owner: "owner",
        name: "repo2",
        ssh_url: "ssh://repo2",
        parent: {
          ssh_url: "ssh://parent-repo2",
        },
      },
    ]);
  });

  it("getRepos - fetch repositories", async () => {
    const options = {
      username: "testuser",
      token: "valid-token",
      verbose: false,
    };
    const result = await getRepos(options);

    expect(result[0]).toEqual({
      fork: false,
      template: false,
      owner: "paazmaya",
      name: "renshuu.paazmaya.fi",
      ssh_url: "git@github.com:paazmaya/renshuu.paazmaya.fi.git",
      parent: {
        ssh_url: null,
      },
    });
  });

  it("getRepos - verbose output", async () => {
    const options = {
      username: "testuser",
      token: "valid-token",
      verbose: true,
    };

    const originalLog = console.log;
    let logOutput = "";
    console.log = (message) => {
      logOutput += message;
    };

    try {
      await getRepos(options);
      expect(logOutput).toContain('Fetching information on user repositories for "testuser"');
    } finally {
      console.log = originalLog;
    }
  });

  it("getRepos - organization repositories with @ prefix", async () => {
    const options = {
      username: "@testorg",
      token: "valid-token",
      verbose: false,
    };
    const result = await getRepos(options);

    expect(options.username).toBe("testorg");
    expect(result[0].owner).toBe("paazmaya");
  });

  it("getRepos - initializes query if not provided", async () => {
    const options = {
      username: "testuser",
      token: "valid-token",
      verbose: false,
    };

    try {
      await getRepos(options);
      expect(options.query).toBeTruthy();
    } catch {
      expect.fail("Should not throw an error");
    }
  });
});
