/// <reference types="cypress" />
import { ethers } from 'ethers'

export function dataTestid(value) {
  return cy.get(`[data-testid=${value}]`)
}

export function connectWallet() {
  cy.intercept('https://api.curve.fi/api/getGas').as('apiGetGas')
  cy.visit('http://localhost:3000')

  // wait for api to load before connecting wallet
  cy.wait('@apiGetGas')
  cy.url().should('include', 'ethereum/swap')

  // validate connect wallet button has updated to signer address
  cy.dataTestid('btn-navigation-connect-wallet').click()
  cy.get('onboard-v2').shadow().contains('MetaMask').click()
  cy.dataTestid('btn-navigation-connect-wallet').should(($btn) => {
    expect($btn.text()).to.include('0x')
  })

  // validate window.ethereum has signer address
  cy.window().then(($win) => {
    cy.log('window.ethereum', $win.ethereum)
    if (typeof $win.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider($win.ethereum)
      const signer = provider.getSigner().then((signer) => signer)
      cy.wrap(signer).then(($accounts) => {
        expect($accounts).to.be.a('string')
      })
    }
  })
}

Cypress.Commands.add('dataTestid', dataTestid)
Cypress.Commands.add('connectWallet', connectWallet)
