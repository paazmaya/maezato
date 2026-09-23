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
import { describe, it, expect } from "vitest";
import {
  getRepositoryType,
  buildClonePath,
  buildGitCloneCommand,
  buildExecOptions,
  handleExecCallback,
} from "../../lib/clone-repo.ts";

describe("clone-repo", () => {
  describe("getRepositoryType", () => {
    it('should return "templates" for template repositories', () => {
      const item = {
        template: true,
        fork: false,
        owner: "user",
      };
      const options = {
        username: "user",
      };

      const result = getRepositoryType(item, options);
      expect(result).toBe("templates");
    });

    it('should return "fork" for forked repositories', () => {
      const item = {
        template: false,
        fork: true,
        owner: "other-user",
      };
      const options = {
        username: "user",
      };

      const result = getRepositoryType(item, options);
      expect(result).toBe("fork");
    });

    it('should return "mine" for own repositories', () => {
      const item = {
        template: false,
        fork: false,
        owner: "user",
      };
      const options = {
        username: "user",
      };

      const result = getRepositoryType(item, options);
      expect(result).toBe("mine");
    });

    it('should return "contributing" for repositories of other users', () => {
      const item = {
        template: false,
        fork: false,
        owner: "other-user",
      };
      const options = {
        username: "user",
      };

      const result = getRepositoryType(item, options);
      expect(result).toBe("contributing");
    });

    it("should prioritize template over fork", () => {
      const item = {
        template: true,
        fork: true,
        owner: "user",
      };
      const options = {
        username: "user",
      };

      const result = getRepositoryType(item, options);
      expect(result).toBe("templates");
    });
  });

  describe("buildClonePath", () => {
    it("should build path with username", () => {
      const type = "mine";
      const options = {
        omitUsername: false,
        username: "testuser",
        cloneBaseDir: "/base/dir",
      };

      const result = buildClonePath(type, options);
      const expected = path.join("/base/dir", "testuser", "mine");

      expect(result).toBe(expected);
    });

    it("should build path without username when omitUsername is true", () => {
      const type = "fork";
      const options = {
        omitUsername: true,
        username: "testuser",
        cloneBaseDir: "/base/dir",
      };

      const result = buildClonePath(type, options);
      const expected = path.join("/base/dir", "fork");

      expect(result).toBe(expected);
    });

    it("should build path for templates type", () => {
      const type = "templates";
      const options = {
        omitUsername: false,
        username: "testuser",
        cloneBaseDir: "/home/user",
      };

      const result = buildClonePath(type, options);
      const expected = path.join("/home/user", "testuser", "templates");

      expect(result).toBe(expected);
    });

    it("should build path for contributing type", () => {
      const type = "contributing";
      const options = {
        omitUsername: false,
        username: "testuser",
        cloneBaseDir: "/repos",
      };

      const result = buildClonePath(type, options);
      const expected = path.join("/repos", "testuser", "contributing");

      expect(result).toBe(expected);
    });
  });

  describe("buildGitCloneCommand", () => {
    it("should construct command with SSH URL", () => {
      const sshUrl = "git@github.com:user/repo.git";
      const result = buildGitCloneCommand(sshUrl);
      const expected = "git clone git@github.com:user/repo.git";

      expect(result).toBe(expected);
    });

    it("should handle different URL formats", () => {
      const sshUrl1 = "git@github.com:org/project.git";
      const result1 = buildGitCloneCommand(sshUrl1);
      expect(result1.startsWith("git clone")).toBe(true);
      expect(result1).toContain(sshUrl1);
    });
  });

  describe("buildExecOptions", () => {
    it("should create options with correct properties", () => {
      const clonePath = "/path/to/clone";
      const result = buildExecOptions(clonePath);

      expect(result.cwd).toBe(clonePath);
      expect(result.env).toBe(process.env);
      expect(result.encoding).toBe("utf8");
      expect(result.cwd && result.env && result.encoding).toBeTruthy();
    });
  });

  describe("handleExecCallback", () => {
    it("should fulfill on success", () => {
      let fulfilled = false;
      const fulfill = () => {
        fulfilled = true;
      };
      const reject = () => {};

      handleExecCallback(null, "", "", "git@test.git", fulfill, reject);

      expect(fulfilled).toBe(true);
    });

    it("should reject on error not about existing directory", () => {
      let rejected = false;
      const fulfill = () => {};
      const reject = () => {
        rejected = true;
      };

      const error = new Error("Some git error");
      handleExecCallback(
        error,
        "",
        "fatal: unable to create directory",
        "git@test.git",
        fulfill,
        reject,
      );

      expect(rejected).toBe(true);
    });

    it("should fulfill on already exists error", () => {
      let fulfilled = false;
      const fulfill = () => {
        fulfilled = true;
      };
      const reject = () => {};

      const error = new Error("Directory exists");
      handleExecCallback(
        error,
        "",
        "already exists and is not an empty directory",
        "git@test.git",
        fulfill,
        reject,
      );

      expect(fulfilled).toBe(true);
    });
  });
});
