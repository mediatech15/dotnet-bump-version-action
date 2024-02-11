import * as core from "@actions/core";
import * as github from "@actions/github";
import { Bump } from "./Bump";
import { commit } from "./Commit";
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
    const bump = new Bump(file, inputs);
    if (bump.bump()) {
      bumpedFiles.push(file);
      if (toVersion === "") {
        toVersion = bump.newVersion;
      }
    }
  });
  if (inputs.needPushChanges && bumpedFiles.length > 0) {
    await commit(bumpedFiles, "Bump versions by dotnet-bump-version-action", inputs, toVersion);
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
