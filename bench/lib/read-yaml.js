'use strict'

const FS = require('fs')
const YAML = require('js-yaml')

function readYamlSync (path) {
  const dataString = FS.readFileSync(path)
  return YAML.safeLoad(dataString, { filename: path })
}

module.exports = readYamlSync
