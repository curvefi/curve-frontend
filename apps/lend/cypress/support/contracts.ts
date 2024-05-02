import { ethers } from 'ethers'

export function balanceOfErc20(
  wallet: ethers.Wallet | ethers.HDNodeWallet,
  tokenAddress: string
): Cypress.Chainable<BigInt> {
  return cy.then(async () => {
    const _erc20Contract = new ethers.Contract(
      tokenAddress,
      ['function balanceOf(address owner) view returns (uint256)'],
      wallet
    )
    return await _erc20Contract.balanceOf(wallet.address)
  })
}
