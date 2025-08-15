import { ethers } from 'ethers'
import { Eip1193BridgeV6 } from '@cy/tools/Eip1193BridgeV6'

export function injectMetamaskProvider(win: Cypress.AUTWindow, wallet: ethers.HDNodeWallet) {
  win.ethereum = new Eip1193BridgeV6(wallet)
  win.ethereum.isMetaMask = true
}

export function prepareMetamaskWallet(wallet: ethers.HDNodeWallet): Cypress.Chainable<ethers.HDNodeWallet> {
  cy.on('window:before:load', (win) => {
    injectMetamaskProvider(win, wallet)
  })
  return cy.wrap(wallet)
}

export function connectMetamask(wallet: ethers.HDNodeWallet): Cypress.Chainable<ethers.HDNodeWallet> {
  cy.dataTestId('btn-navigation-connect-wallet').as('walletButton').click()
  cy.get('onboard-v2').shadow().contains('MetaMask').click()

  const walletButtonSign = wallet.address.substring(0, 6)
  cy.get('@walletButton').should('not.contain.text', 'Connecting')
  cy.get('@walletButton').should('contain.text', walletButtonSign, { matchCase: false }).log('Wallet connected')

  return cy.wrap(wallet)
}
