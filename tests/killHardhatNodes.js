const { exec } = require('child_process')
const networks = require('./cypress/fixtures/networks.json')

const BASIC_PORT = 8545

const killNode = (chainId) => {
  return new Promise((resolve, reject) => {
    const port = BASIC_PORT + chainId
    const command = `lsof -ti tcp:${port} | xargs kill`

    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error killing Chain ID '${chainId}' node at port ${port}: ${stderr}`)
        return
      }
      console.info(`Killed Chain ID '${chainId}' node at port ${port}`)
      resolve(stdout)
    })
  })
}

const main = async () => {
  const args = process.argv.slice(2)
  const idsToKill = args.length > 0 ? args[0].split(',').map(Number) : Object.values(networks).map(({ id }) => id)

  try {
    await Promise.all(idsToKill.map(killNode))
    console.info('Selected nodes killed successfully.')
  } catch (error) {
    console.error(error)
  }
}

main()
