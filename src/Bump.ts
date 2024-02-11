import * as core from '@actions/core'
import * as fs from 'fs'
import { Inputs } from './Inputs'
import * as semver from 'semver'

export class Bump {
  // Version vs VersionSuffix vs PackageVersion: What do they all mean?
  // https://andrewlock.net/version-vs-versionsuffix-vs-packageversion-what-do-they-all-mean/
  // There's an overwhelming number of versions to choose from, but generally it's best to just set the Version and use it for all of the version numbers.
  private static readonly _semverRex = '(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?'

  private static readonly _assemblyRex = '(\\d+)\\.(\\d+)\\.(\\d+)\\.(\\d+)'

  private static readonly _versionRex = new RegExp(`<(Version)>(${this._semverRex})</Version>`, 'gm')

  private static readonly _packageVersionRex = new RegExp(`<(PackageVersion)>(${this._semverRex})</PackageVersion>`, 'gm')

  private static readonly _assemblyVersionRex = new RegExp(`<(AssemblyVersion)>(${this._assemblyRex})</AssemblyVersion>`, 'gm')

  private static readonly _fileVersionRex = new RegExp(`<(FileVersion)>(${this._assemblyRex})</FileVersion>`, 'gm')

  private static readonly _informationalVersionRex = new RegExp(`<(InformationalVersion)>(${this._semverRex})</InformationalVersion>`, 'gm')

  private static readonly _versions = {
    Version: this._versionRex,
    PackageVersion: this._packageVersionRex,
    InformationalVersion: this._informationalVersionRex,
    AssemblyVersion: this._assemblyVersionRex,
    FileVersion: this._fileVersionRex
  }

  private readonly _file: string

  private readonly _inputs: Inputs

  public newVersion: string = ''

  constructor (file: string, inputs: Inputs) {
    this._file = file
    this._inputs = inputs
  }

  public bump (): boolean {
    core.debug(`Bump.bump file: ${this._file}`)
    const originContent = fs.readFileSync(this._file).toString()
    core.debug('Bump.bump originContent: ')
    core.debug(originContent)
    let modified = false
    let semverValue = ''
    for (const [key, value] of Object.entries(Bump._versions)) {
      let outVal = ''
      core.info(`Working on ${key}`)
      const match = value.exec(originContent)
      core.debug('Bump.bump match: ')
      core.debug(JSON.stringify(match))
      if (key === 'AssemblyVersion' || key === 'FileVersion') {
        if (semverValue === '' && !this._inputs.readOnly) {
          core.setFailed('No semver fields matched or we processed')
          process.exit(1)
        } else {
          if (match !== null && match.length > 3) {
            if (this._inputs.readOnly) {
              outVal = match[2]
            } else {
              const semParsed = semver.parse(semverValue)
              if (semParsed !== null) {
                let buildNum = 0
                if (semParsed.prerelease.length !== 0) {
                  const lastEle = semParsed.prerelease.slice(-1)[0]
                  if (lastEle === lastEle && typeof lastEle === 'number') { // eslint-disable-line
                    buildNum = lastEle
                  }
                }
                const assemVer = `${semParsed.major}.${semParsed.minor}.${semParsed.patch}.${buildNum}`
                outVal = assemVer
                this.replaceInFile(value, assemVer)
                modified = true
              }
            }
          } else {
            core.info('Not found')
          }
        }
      } else {
        if (match !== null && match.length > 3) {
          if (this._inputs.readOnly) {
            outVal = match[2]
          } else {
            outVal = match[2]
            if (semverValue === '') {
              const update = semver.inc(match[2], semver.RELEASE_TYPES[this._inputs.bump], false, this._inputs.preTag)
              if (update !== null) {
                semverValue = update
                outVal = semverValue
                this.newVersion = update
                this.replaceInFile(value, semverValue)
                modified = true
              } else {
                core.warning('Unable to increment version. Was not updated')
                core.warning(match[2])
              }
            } else {
              outVal = semverValue
              this.replaceInFile(value, semverValue)
              modified = true
            }
          }
        } else {
          core.info('Not found')
        }
      }
      core.setOutput(key, outVal)
    }
    return modified
  }

  private replaceInFile (reg: RegExp, value: string): void {
    const originContent = fs.readFileSync(this._file).toString()
    const newFile = originContent.replace(reg, `<$1>${value}</$1>`)
    fs.writeFileSync(this._file, newFile, { encoding: 'utf8' })
  }
}
