process.env.NODE_ENV = process.env.NODE_ENV || 'development'

require('dotenv-flow').config()

const { exec, spawn } = require('child_process')
const waitOn = require('wait-on')

const Chains = require('./cypress/fixtures/chains.json')
const BASIC_PORT = 8545
const HOST_NAME = '127.0.0.1'

const checkPort = (port) => {
  return new Promise((resolve, reject) => {
    exec(`lsof -i tcp:${port}`, (error, stdout, stderr) => {
      if (error) {
        resolve(false) // Port is not in use
      } else {
        resolve(true) // Port is in use
      }
    })
  })
}

const startNode = (chainId) => {
  return new Promise(async (resolve, reject) => {
    const env = { ...process.env, HARDHAT_CHAIN_ID: chainId }
    const port = BASIC_PORT + chainId

    const isPortInUse = await checkPort(port)
    if (isPortInUse) {
      console.log(`Chain ID '${chainId}' node is already running at http://${HOST_NAME}:${port}`)
      resolve()
      return
    }

    const command = `npx hardhat node --config ./hardhat.config.js --port ${port} --hostname ${HOST_NAME}`

    const nodeProcess = spawn('sh', ['-c', command], { env })
    nodeProcess.on('close', (code) => {
      if (code !== 0) {
        reject(`Node process exited with code ${code}`)
      }
    })

    waitOn(
      {
        resources: [`http-get://${HOST_NAME}:${port}`, `tcp:${HOST_NAME}:${port}`],
        delay: 500,
        interval: 500,
        timeout: 30000,
      },
      (err) => {
        if (err) {
          nodeProcess.kill()
          reject(`Chain ID '${chainId}' node not responding at http://${HOST_NAME}:${port}. Error: ${err}`)
        } else {
          console.log(`Chain ID '${chainId}' node started at http://${HOST_NAME}:${port}`)
          resolve(nodeProcess)
        }
      }
    )
  })
}

const main = async () => {
  const chainIds = Object.values(Chains).map(({ id }) => id)
  const args = process.argv.slice(2)
  const inputChainIds = args.length > 0 ? args[0].split(',').map(Number) : chainIds

  const validChainIds = inputChainIds.filter((chainId) => {
    if (!chainIds.includes(chainId)) {
      console.error(`Error: Chain ID '${chainId}' does not exist.`)
      return false
    }
    return true
  })

  if (validChainIds.length === 0) {
    console.error('No valid Chain IDs provided. Exiting.')
    process.exit(1)
  }

  try {
    await Promise.all(validChainIds.map(startNode))
    console.log('Selected nodes started successfully.')
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

main()
