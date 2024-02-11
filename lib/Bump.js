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
var Bump_exports = {};
__export(Bump_exports, {
  Bump: () => Bump
});
module.exports = __toCommonJS(Bump_exports);
var core = __toESM(require("@actions/core"));
var fs = __toESM(require("fs"));
var semver = __toESM(require("semver"));
class Bump {
  constructor(file, inputs) {
    this.newVersion = "";
    this._file = file;
    this._inputs = inputs;
  }
  static {
    // Version vs VersionSuffix vs PackageVersion: What do they all mean?
    // https://andrewlock.net/version-vs-versionsuffix-vs-packageversion-what-do-they-all-mean/
    // There's an overwhelming number of versions to choose from, but generally it's best to just set the Version and use it for all of the version numbers.
    this._semverRex = "(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?";
  }
  static {
    this._assemblyRex = "(\\d+)\\.(\\d+)\\.(\\d+)\\.(\\d+)";
  }
  static {
    this._versionRex = new RegExp(`<(Version)>(${this._semverRex})</Version>`, "gm");
  }
  static {
    this._packageVersionRex = new RegExp(`<(PackageVersion)>(${this._semverRex})</PackageVersion>`, "gm");
  }
  static {
    this._assemblyVersionRex = new RegExp(`<(AssemblyVersion)>(${this._assemblyRex})</AssemblyVersion>`, "gm");
  }
  static {
    this._fileVersionRex = new RegExp(`<(FileVersion)>(${this._assemblyRex})</FileVersion>`, "gm");
  }
  static {
    this._informationalVersionRex = new RegExp(`<(InformationalVersion)>(${this._semverRex})</InformationalVersion>`, "gm");
  }
  static {
    this._versions = {
      Version: this._versionRex,
      PackageVersion: this._packageVersionRex,
      InformationalVersion: this._informationalVersionRex,
      AssemblyVersion: this._assemblyVersionRex,
      FileVersion: this._fileVersionRex
    };
  }
  bump() {
    core.debug(`Bump.bump file: ${this._file}`);
    const originContent = fs.readFileSync(this._file).toString();
    core.debug("Bump.bump originContent: ");
    core.debug(originContent);
    let modified = false;
    let semverValue = "";
    for (const [key, value] of Object.entries(Bump._versions)) {
      let outVal = "";
      core.info(`Working on ${key}`);
      const match = value.exec(originContent);
      core.debug("Bump.bump match: ");
      core.debug(JSON.stringify(match));
      if (key === "AssemblyVersion" || key === "FileVersion") {
        if (semverValue === "" && !this._inputs.readOnly) {
          core.setFailed("No semver fields matched or we processed");
          process.exit(1);
        } else {
          if (match !== null && match.length > 3) {
            if (this._inputs.readOnly) {
              outVal = match[2];
            } else {
              const semParsed = semver.parse(semverValue);
              if (semParsed !== null) {
                let buildNum = 0;
                if (semParsed.prerelease.length !== 0) {
                  const lastEle = semParsed.prerelease.slice(-1)[0];
                  if (lastEle === lastEle && typeof lastEle === "number") {
                    buildNum = lastEle;
                  }
                }
                const assemVer = `${semParsed.major}.${semParsed.minor}.${semParsed.patch}.${buildNum}`;
                outVal = assemVer;
                this.replaceInFile(value, assemVer);
                modified = true;
              }
            }
          } else {
            core.info("Not found");
          }
        }
      } else {
        if (match !== null && match.length > 3) {
          if (this._inputs.readOnly) {
            outVal = match[2];
          } else {
            outVal = match[2];
            if (semverValue === "") {
              const update = semver.inc(match[2], semver.RELEASE_TYPES[this._inputs.bump], false, this._inputs.preTag);
              if (update !== null) {
                semverValue = update;
                outVal = semverValue;
                this.newVersion = update;
                this.replaceInFile(value, semverValue);
                modified = true;
              } else {
                core.warning("Unable to increment version. Was not updated");
                core.warning(match[2]);
              }
            } else {
              outVal = semverValue;
              this.replaceInFile(value, semverValue);
              modified = true;
            }
          }
        } else {
          core.info("Not found");
        }
      }
      core.setOutput(key, outVal);
    }
    return modified;
  }
  replaceInFile(reg, value) {
    const originContent = fs.readFileSync(this._file).toString();
    const newFile = originContent.replace(reg, `<$1>${value}</$1>`);
    fs.writeFileSync(this._file, newFile, { encoding: "utf8" });
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Bump
});
