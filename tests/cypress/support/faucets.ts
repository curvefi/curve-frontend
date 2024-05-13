import { ethers } from 'ethers'

export function allocateEth(wallet: ethers.HDNodeWallet, amountStr: string): Cypress.Chainable<ethers.HDNodeWallet> {
  cy.get<ethers.JsonRpcProvider>('@jsonRpcProvider')
    .then((jsonRpcProvider) => {
      cy.get<ethers.Wallet>('@faucetWallet').then(async (faucetWallet) => {
        const _amount = ethers.parseEther(amountStr)
        const _toAddress = wallet.address

        const faucetBalance = await jsonRpcProvider.getBalance(faucetWallet.address)
        assert(faucetBalance > _amount, 'balance is not enough')
        const tx = await faucetWallet.sendTransaction({
          to: _toAddress,
          value: _amount,
        })
        await tx.wait()
        const finalBalance = await jsonRpcProvider.getBalance(_toAddress)
        assert(finalBalance === _amount, 'balance is not as expected')
      })
    })
    .log('Allocated ETH')

  return cy.wrap(wallet)
}

export function allocateERC20Tokens(
  wallet: ethers.HDNodeWallet,
  tokenAddressStr: string,
  amountStr: string
): Cypress.Chainable<ethers.HDNodeWallet> {
  cy.get<ethers.Wallet>('@faucetWallet')
    .then(async (faucetWallet) => {
      const _amount = ethers.parseEther(amountStr)
      const _toAddress = wallet.address
      const _erc20Contract = new ethers.Contract(
        tokenAddressStr,
        [
          'function transfer(address to, uint amount) returns (bool)',
          'function balanceOf(address owner) view returns (uint256)',
        ],
        faucetWallet
      )

      const faucetBalance = await _erc20Contract.balanceOf(faucetWallet.address)
      assert(faucetBalance >= _amount, 'balance is not enough')
      const tx = await _erc20Contract.transfer(_toAddress, _amount)
      await tx.wait()

      const balance = await _erc20Contract.balanceOf(_toAddress)
      assert(balance === _amount, 'balance is not as expected')
    })
    .log('Allocated ERC20 tokens')

  return cy.wrap(wallet)
}
