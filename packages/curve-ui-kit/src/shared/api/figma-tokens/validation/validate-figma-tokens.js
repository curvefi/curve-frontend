import Ajv from 'ajv'

const ajv = new Ajv()

import schema from './curve-figma-design.tokens.schema.json' assert { type: 'json' }
import curveFigmaDesignTokens from '../tokens/curve-figma-design.tokens.json' assert { type: 'json' }

const validate = ajv.compile(schema)
const valid = validate(curveFigmaDesignTokens)

if (!valid) {
  console.error('Figma tokens validation errors:', validate.errors)
  process.exit(1)
} else {
  console.log('Figma tokens JSON file successfully validated.')
}
