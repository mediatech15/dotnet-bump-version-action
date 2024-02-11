import * as core from '@actions/core'
import * as github from '@actions/github'
import { Bump } from './Bump'
import { commit } from './Commit'

async function bumpVersion (): Promise<void> {
  core.info('dotnet-bump-version-action action is running...')
  core.info('')

  const inputs = (await import('./Inputs.js')).Inputs.current

  if (github.context.eventName !== 'push' && !core.isDebug()) { // eslint-disable-line
    core.info(`Github event is ${github.context.eventName} and not "push", exit.`) // eslint-disable-line
    return
  }

  const versionFiles = await inputs.getVersionFiles()
  core.info('files to version:')
  core.info(JSON.stringify(versionFiles))
  core.info('')

  const bumpedFiles: string[] = []
  let versions = ''
  let assemblyVersions = ''
  let toVersion = ''

  versionFiles.forEach(file => {
    const bump = new Bump(file, inputs)
    if (bump.bump()) {
      bumpedFiles.push(file)
      if (toVersion === '') {
        toVersion = bump.newVersion
      }
      if (bump.newVersion !== '' && !versions.includes(`${bump.newVersion};`)) {
        versions += `${bump.newVersion};`
      }
      if (bump.newAssemblyVersion !== '' && !assemblyVersions.includes(`${bump.newAssemblyVersion};`)) {
        assemblyVersions += `${bump.newAssemblyVersion};`
      }
    }
  })

  versions = versions.endsWith(';') ? versions.slice(0, -1) : versions
  assemblyVersions = assemblyVersions.endsWith(';') ? assemblyVersions.slice(0, -1) : assemblyVersions

  if (inputs.needPushChanges && bumpedFiles.length > 0) {
    await commit(bumpedFiles, 'Bump versions by dotnet-bump-version-action', inputs, toVersion)
  }
  core.setOutput('version', versions)
  core.setOutput('assembly_version', assemblyVersions)

  core.info('dotnet-bump-version-action action is finished')
}

async function run (): Promise<void> {
  try {
    await bumpVersion()
  } catch (error: unknown) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run().catch(error => {
  if (error instanceof Error) {
    core.setFailed(error.message)
  }
})
