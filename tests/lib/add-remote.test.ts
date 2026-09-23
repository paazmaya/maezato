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

import { describe, it, expect } from "vitest";
import addRemote from "../../lib/add-remote.ts";

describe("add-remote", () => {
  it("exposes function", () => {
    expect(typeof addRemote).toBe("function");
    expect(addRemote.length).toBe(5);
  });

  it("addRemote - adding remote hoplaa to a non-existing project", () => {
    return addRemote({}, "fork cloned somewhere here", "hoplaa", "git:////////hoplaa", {
      token: "",
      verbose: true,
    })
      .then(() => {
        expect.fail("Should have failed");
      })
      .catch(() => {
        // Expected to fail
      });
  });

  it("addRemote - verbose output", async () => {
    const item = {};
    const forkPath = "fork/cloned/somewhere/here";
    const remoteName = "upstream";
    const sshUrl = "git@github.com:user/repo.git";
    const options = {
      verbose: true,
    };

    const originalLog = console.log;
    let logOutput = "";
    console.log = (message) => {
      logOutput += message;
    };

    try {
      await addRemote(item, forkPath, remoteName, sshUrl, options);
    } catch {
      // Expected to fail since directory doesn't exist
    } finally {
      expect(logOutput).toContain(`Adding remote information "${remoteName}" = "${sshUrl}"`);
      console.log = originalLog;
    }
  });
});
