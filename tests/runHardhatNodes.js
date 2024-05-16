process.env.NODE_ENV = process.env.NODE_ENV || 'development'

require('dotenv-flow').config()

const { exec, spawn } = require('child_process')
const waitOn = require('wait-on')

// TODO: move this to a constants file
const ChainId = {
  MAINNET: 1,
  POLYGON: 137,
}

const BASIC_PORT = 8545

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
      console.log(`Chain ID '${chainId}' node is already running at http://127.0.0.1:${port}`)
      resolve()
      return
    }

    const command = `npx hardhat node --config ./hardhat.config.js --port ${port}`

    const nodeProcess = spawn('sh', ['-c', command], { env })
    nodeProcess.on('close', (code) => {
      if (code !== 0) {
        reject(`Node process exited with code ${code}`)
      }
    })

    waitOn(
      {
        resources: [`http-get://127.0.0.1:${port}`, `tcp:127.0.0.1:${port}`],
        delay: 500,
        interval: 500,
        timeout: 30000,
      },
      (err) => {
        if (err) {
          nodeProcess.kill()
          reject(`Chain ID '${chainId}' node not responding at http://127.0.0.1:${port}. Error: ${err}`)
        } else {
          console.log(`Chain ID '${chainId}' node started at http://127.0.0.1:${port}`)
          resolve(nodeProcess)
        }
      }
    )
  })
}

const main = async () => {
  const chainIds = Object.values(ChainId)
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
    process.exit(0)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

main()
