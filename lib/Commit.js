import * as core from "@actions/core";
import { exec } from "@actions/exec";
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
      await exec("git", ["config", "user.name", `"${authorName}"`], options);
      core.info(`git config user.email "${authorEmail}"`);
      await exec("git", ["config", "user.email", `"${authorEmail}"`], options);
      if (inputs.doCommit) {
        core.info("Committing Version");
        for (const file of filesToCommit) {
          core.info(`git add "${file}"`);
          await exec("git", ["add", file], options);
        }
        core.info(`git commit -m "${message}"`);
        await exec("git", ["commit", "-m", `${message}`], options);
        if (inputs.doTag) {
          core.info("Tagging Version");
          core.info(`git tag ${newVersion}`);
          await exec("git", ["tag", `${newVersion}`], options);
        }
      }
      if (inputs.doCommit) {
        core.info(`git push ${remoteRepo} HEAD:${branch}`);
        await exec("git", ["push", `${remoteRepo}`, `HEAD:${branch}`], options);
        if (inputs.doTag) {
          core.info(`git push ${remoteRepo} tag ${newVersion}`);
          await exec("git", ["push", `${remoteRepo}`, "tag", `${newVersion}`], options);
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
export {
  commit
};
