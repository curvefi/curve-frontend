import { ethers } from 'ethers'
import TokensList from '@cy/fixtures/tokens.json'
import WhalesList from '@cy/fixtures/whales.json'
import { setEthBalance, allocateToken, getTokenBalance } from '@cy/tools/network'

/**
 * Creates a random wallet with the given Ethereum JSON RPC provider.
 *
 * @param {ethers.JsonRpcProvider} jsonRpcProvider - The Ethereum JSON RPC provider.
 * @param {bigint | string} [eth] - The amount of Ether to allocate to the wallet.
 * @param {Array<{ symbol: string; amount: bigint | string }>} [tokens] - An array of tokens to allocate to the wallet.
 * @return {Cypress.Chainable<ethers.HDNodeWallet>} - A Cypress chainable object representing the created wallet.
 */
export function createRandomWallet(
  jsonRpcProvider: ethers.JsonRpcProvider,
  eth?: bigint | string,
  tokens?: [{ symbol: string; amount: bigint | string }],
): Cypress.Chainable<ethers.HDNodeWallet> {
  eth = typeof eth === 'string' ? ethers.parseEther(eth) : eth

  return cy.then(async () => {
    const wallet = ethers.Wallet.createRandom(jsonRpcProvider)
    const network = await jsonRpcProvider.getNetwork()

    if (eth) {
      await setEthBalance(wallet.address, eth, jsonRpcProvider)
    }

    if (tokens) {
      await Promise.all(
        tokens.map(async ({ symbol, amount }) => {
          const token = TokensList[network.name][symbol]
          const whales = WhalesList[network.name][symbol]
          await allocateToken(
            wallet.address,
            token.address,
            typeof amount === 'string' ? ethers.parseEther(amount) : amount,
            whales,
            jsonRpcProvider,
          )
        }),
      )
    }
    return wallet
  })
}

export function allocateEth(wallet: ethers.HDNodeWallet, eth: bigint | string): Cypress.Chainable<ethers.HDNodeWallet> {
  eth = typeof eth === 'string' ? ethers.parseEther(eth) : eth

  return cy.then(async () => {
    await setEthBalance(wallet.address, eth, wallet.provider as ethers.JsonRpcProvider)
    return wallet
  })
}

export function tokenBalance(wallet: ethers.HDNodeWallet, token: string): Cypress.Chainable<bigint> {
  return cy.then(async () => await getTokenBalance(token, wallet.address, wallet.provider as ethers.JsonRpcProvider))
}
