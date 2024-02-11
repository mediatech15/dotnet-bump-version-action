import * as core from '@actions/core'

export class Inputs {
  private static readonly _instance: Inputs = new Inputs()
  private _versionFiles: string[] = []

  private constructor () {
    core.info('Inputs')
    core.info('')
    core.info(`Inputs.versionFiles: ${this.versionFiles}`)
    core.info(`Inputs.versionFilesPatterns: ${JSON.stringify(this.versionFilesPatterns)}`)
    core.info('')
    core.info(`Inputs.bump: ${this.bump}`)
    core.info(`Inputs.pre_tag: ${this.preTag}`)
    core.info(`Inputs.build_meta: ${this.buildMeta}`)
    core.info(`Inputs.read_only: ${this.readOnly}`) // eslint-disable-line
    core.info(`Inputs.do_commit: ${this.doCommit}`) // eslint-disable-line
    core.info(`Inputs.do_tag: ${this.doTag}`) // eslint-disable-line
    core.info('')
  }

  public static get current (): Inputs {
    return Inputs._instance
  }

  public get versionFiles (): string {
    return core.getInput('version_files')
  }

  public get bump (): string {
    const val = core.getInput('bump', { required: true })
    if (['major', 'minor', 'patch', 'premajor', 'preminor', 'prepatch', 'prerelease'].includes(val)) {
      return val
    } else {
      core.setFailed('Invalid input for bump')
      process.exit(1)
    }
  }

  public get preTag (): string {
    return core.getInput('pre_tag')
  }

  public get githubToken (): string {
    return core.getInput('github_token')
  }

  public get buildMeta (): string {
    return core.getInput('build_meta')
  }

  public get readOnly (): boolean {
    return core.getBooleanInput('read_only')
  }

  public get doCommit (): boolean {
    return core.getBooleanInput('do_commit')
  }

  public get doTag (): boolean {
    return core.getBooleanInput('do_tag')
  }

  public get versionFilesPatterns (): string[] {
    let patterns: string[] = []

    if (Inputs._isJsonArray(this.versionFiles)) {
      patterns = JSON.parse(this.versionFiles) as string[]
    } else if (typeof this.versionFiles === 'string' && this.versionFiles !== '') {
      patterns = [this.versionFiles]
    }
    return patterns
  }

  public get needPushChanges (): boolean {
    return this.doCommit || this.doTag
  }

  private static _isJsonArray (str: string): boolean {
    if (typeof str === 'string') {
      try {
        const obj = JSON.parse(str) as unknown
        if (obj != null && Array.isArray(obj)) {
          return true
        } else {
          return false
        }
      } catch (error: unknown) {
        // Is is not a json array.
        return false
      }
    }

    // It is not a string!
    return false
  }

  public async getVersionFiles (): Promise<string[]> {
    if (this._versionFiles.length > 0) {
      return this._versionFiles
    }
    const globby = await import('globby')
    this._versionFiles = await globby.globby(this.versionFilesPatterns, {
      gitignore: true,
      expandDirectories: true,
      onlyFiles: true,
      ignore: [],
      cwd: process.cwd()
    })
    core.debug(`Inputs.versionFiles: ${JSON.stringify(this._versionFiles)}`)

    return this._versionFiles
  }
}
