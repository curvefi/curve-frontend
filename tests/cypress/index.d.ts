import { inputMaxCollateral } from './support/collateral'
import { inputMaxBorrow } from './support/debt'
import { approveSpending } from './support/approval'
import { createSofLiquidationLoan } from './support/lend'
import {
  dataTestId,
  createJsonRpcProvider,
  prepareMetamaskWallet,
  createRandomWallet,
  connectMetamask,
  allocateEth,
  tokenBalance,
  cyForEach,
} from './support/helpers'

type DropFirst<T extends unknown[]> = T extends [any, ...infer U] ? U : never
type ChainableFn<T extends (...args: any) => unknown> = (...args: DropFirst<Parameters<T>>) => ReturnType<T>

declare global {
  namespace Cypress {
    interface Window {
      ethereum?: any
    }

    interface Chainable {
      state: (of: 'window' | 'document') => Chainable<Window>
      dataTestId: typeof dataTestId
      forEach: typeof cyForEach
      createJsonRpcProvider: typeof createJsonRpcProvider
      prepareMetamaskWallet: ChainableFn<typeof prepareMetamaskWallet>
      createRandomWallet: ChainableFn<typeof createRandomWallet>
      connectMetamask: ChainableFn<typeof connectMetamask>
      allocateEth: ChainableFn<typeof allocateEth>
      tokenBalance: ChainableFn<typeof tokenBalance>
      inputMaxCollateral: typeof inputMaxCollateral
      inputMaxBorrow: typeof inputMaxBorrow
      approveSpending: typeof approveSpending
      createSofLiquidationLoan: typeof createSofLiquidationLoan
    }
  }
}
