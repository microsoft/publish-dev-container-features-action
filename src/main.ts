import * as core from '@actions/core'
import * as github from '@actions/github'
import {addMetadataToFeaturesJson, tarDirectory} from './utils'

async function run(): Promise<void> {
  core.debug('Reading input parameters...')

  const shouldPublishFeatures = core.getInput('publish-features') === 'true'
  const shouldPublishTemplate = core.getInput('publish-template') === 'true'

  if (shouldPublishFeatures && shouldPublishTemplate) {
    core.setFailed('Cannot publish features and template at the same time')
    return
  }

  if (shouldPublishFeatures) {
    core.info('Publishing features...')
    packageFeatures()
  }

  if (shouldPublishTemplate) {
    core.info('Publishing template...')
    packageTemplate()
  }
}

async function packageFeatures(): Promise<void> {
  try {
    core.debug('Reading input parameters for packaging features...')
    const featuresPath = core.getInput('path-to-features')

    core.info('Inserting metadata onto devcontainer-features.json')
    await addMetadataToFeaturesJson(featuresPath)

    core.info('Starting to tar')
    await tarDirectory(featuresPath, 'devcontainer-features.tgz')

    core.info('Package features has finished.')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

async function packageTemplate(): Promise<void> {
  try {
    core.info('Starting to tar')
    await tarDirectory('.', 'devcontainer-template.tgz')

    core.info('Package template has finished.')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

// Kick off execution
run()
