import { ethers } from 'ethers'

const BASIC_RPC_URL = 'http://127.0.0.1'
const BASIC_PORT = 8545

export function createJsonRpcProvider(chainId: number = 1) {
  return cy.wrap(new ethers.JsonRpcProvider(`${BASIC_RPC_URL}:${BASIC_PORT + chainId}`))
}
