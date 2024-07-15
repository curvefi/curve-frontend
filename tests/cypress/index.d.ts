import { inputMaxCollateral } from './support/collateral'
import { inputMaxBorrow, inputBorrow } from './support/debt'
import { approveSpending, approveLeverageSpending } from './support/approval'
import { createSofLiquidationLoan, createLeverageLoan, createLeverageLoanFlow, repayLoan } from './support/lend'
import {
  dataTestId,
  createJsonRpcProvider,
  prepareMetamaskWallet,
  createRandomWallet,
  connectMetamask,
  allocateEth,
  tokenBalance,
} from './support/helpers'

type DropFirst<T extends unknown[]> = T extends [any, ...infer U] ? U : never
type ChainableFn<T extends (...args: any) => unknown> = (...args: DropFirst<Parameters<T>>) => ReturnType<T>

declare global {
  namespace Cypress {
    interface Window {
      ethereum?: any
    }

    interface Chainable {
      dataTestId: typeof dataTestId
      createJsonRpcProvider: typeof createJsonRpcProvider
      prepareMetamaskWallet: ChainableFn<typeof prepareMetamaskWallet>
      createRandomWallet: ChainableFn<typeof createRandomWallet>
      connectMetamask: ChainableFn<typeof connectMetamask>
      allocateEth: ChainableFn<typeof allocateEth>
      tokenBalance: ChainableFn<typeof tokenBalance>
      inputMaxCollateral: typeof inputMaxCollateral
      inputBorrow: typeof inputBorrow
      inputMaxBorrow: typeof inputMaxBorrow
      approveSpending: typeof approveSpending
      approveLeverageSpending: typeof approveLeverageSpending
      createLeverageLoan: typeof createLeverageLoan
      createSofLiquidationLoan: typeof createSofLiquidationLoan
      createLeverageLoanFlow: typeof createLeverageLoanFlow
      repayLoan: typeof repayLoan
    }
  }
}
