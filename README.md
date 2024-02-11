# dotnet-bump-version-action

A GitHub Action to easily bump .NET Core project version files(.csproj).

> [!NOTE]
> This was forked from `SiqiLu/dotnet-bump-version` but has ended up being mostly
> rewritten. Credit to `SiqiLu` for the idea and the initial start to this action.

- Bumps the version number in the provided version files(default **/*.csproj).
- Can push the changes to github
- Can tag the version and push
- Can specify a custom pre-release tag or rely on branch name
- Can run in read-only mode to output the versions without modifying

> [!IMPORTANT]
> This action only supports "push" events.

> [!IMPORTANT]
> This action needs write access to content if run in a provate repo

## Supported csproj fields and versioning type

- `<Version>` - Semver
- `<PackageVersion>` - Semver
- `<AssemblyVersion>` - Semver
- `<FileVersion>` - Assmebly
- `<InformationalVersion>` - Assmebly

## Usage

### Example with all fields shown

```yaml
- name: Bump versions
  uses: mediatech15/dotnet-bump-version-action@1.0.0
  with:
    version_files: "**/*.csproj"
    bump: patch
    pre_tag: myAwesomeTag
    read_only: false
    github_token: ${{ secrets.myToken }}
    do_commit: true
    do_tag: true
```
### All inputs with defaults explained

| input | default | about |
| --- | :---: | --- |
|`version_files`|`**/*.csproj`|this is a glob or stringed json array of globs|
|`bump`|Required `none`|the type of versioning to preform. If readonly then any value can be passed|
|`pre_tag`|branch name|the tag to follow in a version in a prerelease build. Will be followed by a build number|
|`read_only`|`false`|reads in and sets output of current versions|
|`github_token`|`env.GITHUB_TOKEN`|a token useable for options used. contents read or write|
|`do_commit`|`false`|should the changes be committed back|
|`do_tag`|`false`|should the commit be tagged. Needs `do_commit` to be `true`|

### Outputs

#### version

This is the semantic version(s) that were either read out or updated to in the run.

#### assembly_version

This is the assembly version(s) that were either read out or updated to in the run.

> [!WARNING]
> These may not have the same number of elements as it is based on the fields in a given csproj

> [!IMPORTANT]
> This only outputs unique values not each one.

> [!NOTE]
> If multiple versions are to be output they will be separated with semi-colons
>
> Ex. `1.0.0;1.1.0;1.1.1`

> [!TIP]
> If you need to version multiple packages/projects and use the outputs the action multiple times with different globs

## License

The scripts and documentation in this project are released under the [MIT License](LICENSE)
