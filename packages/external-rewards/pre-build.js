const fs = require('fs')
const path = require('path')

// Define the directory and the output file
const campaignsDir = path.join(__dirname, 'src', 'campaigns')
const outputFilePath = path.join(campaignsDir, 'index.ts')

// Function to get all .json files in the campaigns directory
const getJsonFiles = (dir) => {
  return fs.readdirSync(dir).filter((file) => file.endsWith('.json'))
}

// Function to generate the index.ts content
const generateIndexContent = (jsonFiles) => {
  const comment = `// This file is auto-generated. Do not edit.\n\n`
  const imports = jsonFiles.map((file) => {
    const moduleName = path.basename(file, '.json')
    return `import ${moduleName} from './${file}';`
  })

  const exports = `export {\n  ${jsonFiles.map((file) => path.basename(file, '.json')).join(',\n  ')}\n};`

  return `${comment}${imports.join('\n')}\n\n${exports}\n`
}

// Main function to create the index.ts file
const createIndexFile = () => {
  const jsonFiles = getJsonFiles(campaignsDir)
  const indexContent = generateIndexContent(jsonFiles)

  fs.writeFileSync(outputFilePath, indexContent, 'utf8')
  console.log(`Generated ${outputFilePath}`)
}

// Run the script
createIndexFile()
