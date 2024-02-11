import * as core from "@actions/core";
import * as fs from "fs";
import * as semver from "semver";
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
      const match = originContent.match(value);
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
export {
  Bump
};
