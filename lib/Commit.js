"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var Commit_exports = {};
__export(Commit_exports, {
  commit: () => commit
});
module.exports = __toCommonJS(Commit_exports);
var core = __toESM(require("@actions/core"));
var import_exec = require("@actions/exec");
const commit = async (filesToCommit, message, inputs, newVersion) => {
  try {
    if (inputs.doCommit || inputs.doTag) {
      const options = {
        cwd: process.cwd(),
        listeners: {
          stdline: core.debug,
          stderr: core.debug,
          debug: core.debug
        }
      };
      const authorEmail = "github-actions[bot]@users.noreply.github.com";
      const authorName = "github-actions[bot]";
      const branch = process.env.GITHUB_REF_NAME?.endsWith("/merge") ? process.env.GITHUB_HEAD_REF : process.env.GITHUB_REF_NAME;
      const repository = process.env.GITHUB_REPOSITORY;
      const ghActor = process.env.GITHUB_ACTOR;
      const remoteRepo = `https://${ghActor}:${inputs.githubToken}@github.com/${repository}.git`;
      core.info(`git config user.name "${authorName}"`);
      await (0, import_exec.exec)("git", ["config", "user.name", `"${authorName}"`], options);
      core.info(`git config user.email "${authorEmail}"`);
      await (0, import_exec.exec)("git", ["config", "user.email", `"${authorEmail}"`], options);
      if (inputs.doCommit) {
        core.info("Committing Version");
        for (const file of filesToCommit) {
          core.info(`git add "${file}"`);
          await (0, import_exec.exec)("git", ["add", file], options);
        }
        core.info(`git commit -m "${message}"`);
        await (0, import_exec.exec)("git", ["commit", "-m", `${message}`], options);
        if (inputs.doTag) {
          core.info("Tagging Version");
          core.info(`git tag ${newVersion}`);
          await (0, import_exec.exec)("git", ["tag", `${newVersion}`], options);
        }
      }
      if (inputs.doCommit) {
        core.info(`git push ${remoteRepo} HEAD:${branch}`);
        await (0, import_exec.exec)("git", ["push", `${remoteRepo}`, `HEAD:${branch}`], options);
        if (inputs.doTag) {
          core.info(`git push ${remoteRepo} tag ${newVersion}`);
          await (0, import_exec.exec)("git", ["push", `${remoteRepo}`, "tag", `${newVersion}`], options);
        }
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      core.error(error.message);
      core.setFailed(error.message);
    }
    process.exit(1);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  commit
});
