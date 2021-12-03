import * as core from '@actions/core'
import * as github from '@actions/github'
import {addMetadataToFeaturesJson, tarFeaturesDirectory} from './utils'

async function run(): Promise<void> {
  try {
    core.debug('Reading input parameters...')
    // Defaults to root directory, "."
    const featuresPath = core.getInput('path-to-features')

    core.debug(`Starting...`)

    core.debug('Inserting metadata onto features.json')
    await addMetadataToFeaturesJson(featuresPath)

    core.debug('calling tarFeaturesDirectory()')
    await tarFeaturesDirectory(featuresPath)

    core.debug('Run has finished.')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

// Kick off execution
run()
