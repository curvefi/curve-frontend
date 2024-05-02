import { connectFaucetWallet, createJsonRpcProvider, createRandomWallet } from '@/cy/support/providers'
import { balanceOfErc20 } from './contracts'
import { allocateERC20Tokens, allocateEth } from './faucets'
import { connectMetamask, prepareMetamaskWallet } from './providers'
import { dataTestId } from './helpers'
import { inputMaxCollateral } from './collateral'
import { inputMaxBorrow } from './debt'
import { approveSpending } from './approval'
import { createSofLiquidationLoan } from './lend'

// helpers
Cypress.Commands.add('dataTestId', dataTestId)

// providers
Cypress.Commands.add('createJsonRpcProvider', createJsonRpcProvider)
Cypress.Commands.add('connectFaucetWallet', { prevSubject: true }, connectFaucetWallet)
Cypress.Commands.add('createRandomWallet', { prevSubject: true }, createRandomWallet)
Cypress.Commands.add('prepareMetamaskWallet', { prevSubject: true }, prepareMetamaskWallet)
Cypress.Commands.add('connectMetamask', { prevSubject: true }, connectMetamask)

// chain interactions
Cypress.Commands.add('allocateERC20Tokens', { prevSubject: true }, allocateERC20Tokens)
Cypress.Commands.add('allocateEth', { prevSubject: true }, allocateEth)
Cypress.Commands.add('balanceOfErc20', { prevSubject: true }, balanceOfErc20)

// tests
Cypress.Commands.add('inputMaxCollateral', inputMaxCollateral)
Cypress.Commands.add('inputMaxBorrow', inputMaxBorrow)
Cypress.Commands.add('approveSpending', approveSpending)
Cypress.Commands.add('createSofLiquidationLoan', createSofLiquidationLoan)
