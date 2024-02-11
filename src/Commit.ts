import * as core from '@actions/core'
import { exec, ExecOptions } from '@actions/exec'
import { Inputs } from './Inputs'

export const commit = async (
  filesToCommit: string[],
  message: string,
  inputs: Inputs,
  newVersion: string
): Promise<void> => {
  try {
    if (inputs.doCommit || inputs.doTag) {
      const options = {
        cwd: process.cwd(),
        listeners: {
          stdline: core.debug,
          stderr: core.debug,
          debug: core.debug
        }
      } as unknown as ExecOptions

      const authorEmail = 'github-actions[bot]@users.noreply.github.com'
      const authorName = 'github-actions[bot]'
      const branch = process.env.GITHUB_REF_NAME?.endsWith('/merge') ? process.env.GITHUB_HEAD_REF : process.env.GITHUB_REF_NAME // eslint-disable-line
      const repository = process.env.GITHUB_REPOSITORY
      const ghActor = process.env.GITHUB_ACTOR
      const remoteRepo = `https://${ghActor}:${inputs.githubToken}@github.com/${repository}.git` // eslint-disable-line

      core.info(`git config user.name "${authorName}"`)
      await exec('git', ['config', 'user.name', `"${authorName}"`], options)

      core.info(`git config user.email "${authorEmail}"`)
      await exec('git', ['config', 'user.email', `"${authorEmail}"`], options)

      if (inputs.doCommit) {
        core.info('Committing Version')
        for (const file of filesToCommit) {
          core.info(`git add "${file}"`)
          await exec('git', ['add', file], options)
        }
        core.info(`git commit -m "${message}"`)
        await exec('git', ['commit', '-m', `${message}`], options)
        if (inputs.doTag) {
          core.info('Tagging Version')
          core.info(`git tag ${newVersion}`)
          await exec('git', ['tag', `${newVersion}`], options)
        }
      }
      if (inputs.doCommit) {
        core.info(`git push ${remoteRepo} HEAD:${branch}`) // eslint-disable-line
        await exec('git', ['push', `${remoteRepo}`, `HEAD:${branch}`], options) // eslint-disable-line
        if (inputs.doTag) {
          core.info(`git push ${remoteRepo} ${newVersion}`) // eslint-disable-line
          await exec('git', ['push', `${remoteRepo}`, `${newVersion}`], options) // eslint-disable-line
        }
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.error(error.message)
      core.setFailed(error.message)
    }
    process.exit(1)
  }
}
