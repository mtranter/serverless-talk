const merge = require('merge')
const tsPreset = require('ts-jest/jest-preset')
const dynamoPreset = require("jest-dynalite/jest-preset")

const config = merge(tsPreset, dynamoPreset, {
  testPathIgnorePatterns: ["/node_modules/", "/build/", "/dist/"],
  setupFilesAfterEnv: [
    "jest-dynalite/setupTables",
    "jest-dynalite/clearAfterEach"
  ]
})

module.exports = config
