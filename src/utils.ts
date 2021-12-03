import * as github from '@actions/github'
import * as tar from 'tar'
import * as fs from 'fs'
import * as jsonc from 'jsonc-parser'
import * as core from '@actions/core'
import {Octokit} from '@octokit/core'
import {Api} from '@octokit/plugin-rest-endpoint-methods/dist-types/types'
import {promisify} from 'util'
import path from 'path'
import {FeaturesConfig, SourceInformation} from './contracts/feature'

export const readLocalFile = promisify(fs.readFile)
export const writeLocalFile = promisify(fs.writeFile)

// Filter what gets included in the tar.c
const filter = (file: string, _: tar.FileStat) => {
  // Don't include the archive itself.
  if (file === './features.tgz') {
    return false
  }
  return true
}

export async function tarFeaturesDirectory(path: string) {
  return tar.create({file: 'features.tgz', C: path, filter}, ['.']).then(_ => {
    core.info('Compressed features directory to file features.tgz')
  })
}

export async function addMetadataToFeaturesJson(pathToFeatureDir: string) {
  const p = path.join(pathToFeatureDir, 'features.json')
  const featuresJson = (await (readLocalFile(p) ?? '')).toString()
  if (featuresJson === '') {
    core.setFailed('Could not parse features.json')
    return
  }

  // Insert github repo metadata
  const ref = github.context.ref
  let sourceInformation: SourceInformation = {
    source: 'github',
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ref,
    sha: github.context.sha
  }

  // Add tag if parseable
  if (ref.includes('refs/tags/')) {
    const tag = ref.replace('refs/tags/', '')
    sourceInformation = {...sourceInformation, tag}
  }

  // Read in features.json and append SourceInformation
  let parsed: FeaturesConfig = jsonc.parse(featuresJson)
  parsed = {...parsed, sourceInformation}

  // Write back to the file
  await writeLocalFile(p, JSON.stringify(parsed, undefined, 4))
}
