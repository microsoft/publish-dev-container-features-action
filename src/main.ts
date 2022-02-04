/*--------------------------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See https://go.microsoft.com/fwlink/?linkid=2090316 for license information.
 *-------------------------------------------------------------------------------------------------------------*/

import * as core from '@actions/core'
import * as github from '@actions/github'
import {
  addMetadataToFeaturesJson,
  tarDirectory,
  setupTemplateOutputFolders,
  copyTemplateFiles
} from './utils'

async function run(): Promise<void> {
  core.debug('Reading input parameters...')

  const shouldPublishFeatures = core.getInput('publish-features') === 'true'
  const shouldPublishTemplate = core.getInput('publish-template') === 'true'

  if (shouldPublishFeatures && shouldPublishTemplate) {
    core.setFailed('Cannot publish both features and template at the same time')
    return
  }

  if (shouldPublishFeatures) {
    core.info('Publishing features...')
    const featuresPath = core.getInput('path-to-features') // Default is '.'
    packageFeatures(featuresPath)
  }

  if (shouldPublishTemplate) {
    core.info('Publishing template...')
    const templateName = core.getInput('template-name')
    if (!templateName || templateName === '') {
      core.setFailed('Must specify template name')
      return
    }

    packageTemplate(templateName)
  }
}

async function packageFeatures(featuresPath: string): Promise<void> {
  try {
    core.info('Inserting metadata onto devcontainer-features.json')
    await addMetadataToFeaturesJson(featuresPath)

    core.info('Starting to tar')
    await tarDirectory(featuresPath, 'devcontainer-features.tgz')

    core.info('Package features has finished.')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

async function packageTemplate(templateName: string): Promise<void> {
  try {
    // core.info('Asking vscdc to package template...')
    // const package = require('./vscdc/src/package').package;

    core.info('Setting up output folders...')
    const tmpDir = await setupTemplateOutputFolders(templateName)

    core.info('Copying template files...')
    await copyTemplateFiles(templateName)

    core.info('Starting to tar')
    await tarDirectory(tmpDir, 'devcontainer-template.tgz')

    core.info('Package template has finished.')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

// Kick off execution
run()
