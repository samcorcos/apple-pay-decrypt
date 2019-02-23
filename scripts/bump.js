const fs = require('fs')
const config = require('../package.json')

const { version } = config

// bumps the patch version by 1 on every deploy, in case it isn't done mmanually
const newVersion = version.split('.').map((v, i) => {
  if (i === 2) return (Number(v) + 1)
  return v
}).join('.')

// by default, always increment the patch version
config.version = newVersion

const newConfig = JSON.stringify(config, null, 2)

fs.writeFileSync('./package.json', newConfig)
