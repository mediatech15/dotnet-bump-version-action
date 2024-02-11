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
var Inputs_exports = {};
__export(Inputs_exports, {
  Inputs: () => Inputs
});
module.exports = __toCommonJS(Inputs_exports);
var core = __toESM(require("@actions/core"));
class Inputs {
  constructor() {
    this._versionFiles = [];
    core.info("Inputs");
    core.info("");
    core.info(`Inputs.versionFiles: ${this.versionFiles}`);
    core.info(`Inputs.versionFilesPatterns: ${JSON.stringify(this.versionFilesPatterns)}`);
    core.info("");
    core.info(`Inputs.bump: ${this.bump}`);
    core.info(`Inputs.pre_tag: ${this.preTag}`);
    core.info(`Inputs.build_meta: ${this.buildMeta}`);
    core.info(`Inputs.read_only: ${this.readOnly}`);
    core.info(`Inputs.do_commit: ${this.doCommit}`);
    core.info(`Inputs.do_tag: ${this.doTag}`);
    core.info("");
  }
  static {
    this._instance = new Inputs();
  }
  static get current() {
    return Inputs._instance;
  }
  get versionFiles() {
    return core.getInput("version_files");
  }
  get bump() {
    const val = core.getInput("bump", { required: true });
    if (val in ["major", "minor", "patch", "premajor", "preminor", "prepatch", "prerelease"]) {
      return val;
    } else {
      core.setFailed("Invalid input for bump");
      process.exit(1);
    }
  }
  get preTag() {
    return core.getInput("pre_tag");
  }
  get githubToken() {
    return core.getInput("github_token");
  }
  get buildMeta() {
    return core.getInput("build_meta");
  }
  get readOnly() {
    return core.getBooleanInput("read_only");
  }
  get doCommit() {
    return core.getBooleanInput("do_commit");
  }
  get doTag() {
    return core.getBooleanInput("do_tag");
  }
  get versionFilesPatterns() {
    let patterns = [];
    if (Inputs._isJsonArray(this.versionFiles)) {
      patterns = JSON.parse(this.versionFiles);
    } else if (typeof this.versionFiles === "string" && this.versionFiles !== "") {
      patterns = [this.versionFiles];
    }
    return patterns;
  }
  get needPushChanges() {
    return this.doCommit || this.doTag;
  }
  static _isJsonArray(str) {
    if (typeof str === "string") {
      try {
        const obj = JSON.parse(str);
        if (obj != null && Array.isArray(obj)) {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        return false;
      }
    }
    return false;
  }
  async getVersionFiles() {
    if (this._versionFiles.length > 0) {
      return this._versionFiles;
    }
    const globby = await import("globby");
    this._versionFiles = await globby.globby(this.versionFilesPatterns, {
      gitignore: true,
      expandDirectories: true,
      onlyFiles: true,
      ignore: [],
      cwd: process.cwd()
    });
    core.debug(`Inputs.versionFiles: ${JSON.stringify(this._versionFiles)}`);
    return this._versionFiles;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Inputs
});
