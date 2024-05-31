import { approveSpending, approveLeverageSpending } from './approval'
import { inputMaxCollateral } from './collateral'
import { inputMaxBorrow, inputBorrow } from './debt'
import {
  allocateEth,
  connectMetamask,
  createJsonRpcProvider,
  createRandomWallet,
  dataTestId,
  prepareMetamaskWallet,
  tokenBalance,
} from './helpers'
import { createSofLiquidationLoan, createLeverageLoan } from './lend'

// helpers
Cypress.Commands.add('dataTestId', dataTestId)

// providers
Cypress.Commands.add('createJsonRpcProvider', createJsonRpcProvider)
Cypress.Commands.add('createRandomWallet', { prevSubject: true }, createRandomWallet)
Cypress.Commands.add('prepareMetamaskWallet', { prevSubject: true }, prepareMetamaskWallet)
Cypress.Commands.add('connectMetamask', { prevSubject: true }, connectMetamask)

// chain interactions
Cypress.Commands.add('allocateEth', { prevSubject: true }, allocateEth)
Cypress.Commands.add('tokenBalance', { prevSubject: true }, tokenBalance)

// tests
Cypress.Commands.add('inputMaxCollateral', inputMaxCollateral)
Cypress.Commands.add('inputBorrow', inputBorrow)
Cypress.Commands.add('inputMaxBorrow', inputMaxBorrow)
Cypress.Commands.add('approveSpending', approveSpending)
Cypress.Commands.add('approveLeverageSpending', approveLeverageSpending)
Cypress.Commands.add('createSofLiquidationLoan', createSofLiquidationLoan)
Cypress.Commands.add('createLeverageLoan', createLeverageLoan)
