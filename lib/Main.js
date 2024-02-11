"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var core = __toESM(require("@actions/core"));
var github = __toESM(require("@actions/github"));
var import_Bump = require("./Bump");
var import_Commit = require("./Commit");
async function bumpVersion() {
  core.info("dotnet-bump-version-action action is running...");
  core.info("");
  const inputs = (await import("./Inputs.js")).Inputs.current;
  if (github.context.eventName !== "push") {
    core.info(`Github event is ${github.context.eventName} and not "push", exit.`);
    return;
  }
  const versionFiles = await inputs.getVersionFiles();
  core.info("files to version:");
  core.info(JSON.stringify(versionFiles));
  core.info("");
  const bumpedFiles = [];
  let toVersion = "";
  versionFiles.forEach((file) => {
    const bump = new import_Bump.Bump(file, inputs);
    if (bump.bump()) {
      bumpedFiles.push(file);
      if (toVersion === "") {
        toVersion = bump.newVersion;
      }
    }
  });
  if (inputs.needPushChanges && bumpedFiles.length > 0) {
    await (0, import_Commit.commit)(bumpedFiles, "Bump versions by dotnet-bump-version-action", inputs, toVersion);
  }
  core.info("dotnet-bump-version-action action is finished");
}
async function run() {
  try {
    await bumpVersion();
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
}
run().catch((error) => {
  if (error instanceof Error) {
    core.setFailed(error.message);
  }
});
