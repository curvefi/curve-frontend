process.env.NODE_ENV = process.env.NODE_ENV || 'development'

require('dotenv-flow').config()

const { exec, spawn } = require('child_process')
const waitOn = require('wait-on')

const networks = require('./cypress/fixtures/networks.json')

const BASIC_PORT = 8545
const HOST_NAME = '127.0.0.1'
const BLOCKS_PER_DAY = 7000

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

const getBlockNumber = async (network) => {
  const infuraKey = process.env.INFURA_PROJECT_ID
  const alchemyEnvName = `${network.alias.toUpperCase()}_ALCHEMY_API_KEY`
  const alchemyKey = process.env[alchemyEnvName] ?? ''

  const url = infuraKey
    ? network.infura_rpc.replace('INFURA_PROJECT_ID', infuraKey)
    : network.alchemy_rpc.replace(alchemyEnvName, alchemyKey)

  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      method: 'eth_blockNumber',
      params: [],
      id: 1,
    }),
  })

  if (!resp.ok) {
    throw new Error(`HTTP error! Status: ${resp.status}`)
  }

  const hexBlockNumber = (await resp.json()).result
  const blockNumber = parseInt(hexBlockNumber, 16)
  // user BLOCKS_PER_DAY to prevent maxing forked network quota
  return Math.floor(blockNumber / BLOCKS_PER_DAY) * BLOCKS_PER_DAY
}

const startNode = (network) => {
  return new Promise(async (resolve, reject) => {
    const env = { ...process.env, HARDHAT_CHAIN_ID: network.id.toString() }
    const port = BASIC_PORT + network.id

    const isPortInUse = await checkPort(port)
    if (isPortInUse) {
      console.log(`Network '${network.alias}' node is already running at http://${HOST_NAME}:${port}`)
      resolve(null)
      return
    }

    const blockNumber = await getBlockNumber(network)

    console.log(
      `Starting network '${network.alias}' node at http://${HOST_NAME}:${port} with blockNumber: ${blockNumber}`
    )
    const command = `npx hardhat node --config ./hardhat.config.js --port ${port} --hostname ${HOST_NAME} --fork-block-number ${blockNumber}`
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
          reject(`Network '${network.alias}' node not responding at http://${HOST_NAME}:${port}. Error: ${err}`)
        } else {
          console.log(`Network '${network.alias}' node started at http://${HOST_NAME}:${port}`)
          resolve(nodeProcess)
        }
      }
    )
  })
}

const main = async () => {
  const networkIds = Object.values(networks).map(({ id }) => id)
  const args = process.argv.slice(2)
  const inputNetworkIds = args.length > 0 ? args[0].split(',').map(Number) : networkIds

  const validNetworkIds = inputNetworkIds.filter((networkId) => {
    if (!networkIds.includes(networkId)) {
      console.error(`Error: Network ID '${networkId}' does not exist.`)
      return false
    }
    return true
  })

  if (validNetworkIds.length === 0) {
    console.error('No valid Network IDs provided. Exiting.')
    process.exit(1)
  }

  try {
    await Promise.all(validNetworkIds.map((networkId) => startNode(networks[networkId])))
    console.log('Selected network nodes started successfully.')
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

main()
