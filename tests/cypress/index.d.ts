import { dataTestId } from './support/helpers'
import { connectMetamask, prepareMetamaskWallet } from './support/providers'
import { balanceOfErc20 } from './support/contracts'
import { allocateERC20Tokens, allocateEth } from './support/faucets'
import { connectFaucetWallet, createJsonRpcProvider, createRandomWallet } from './support/providers'
import { inputMaxCollateral } from './support/collateral'
import { inputMaxBorrow } from './support/debt'
import { approveSpending } from './support/approval'
import { createSofLiquidationLoan } from './support/lend'

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
      connectFaucetWallet: ChainableFn<typeof connectFaucetWallet>
      createRandomWallet: ChainableFn<typeof createRandomWallet>
      connectMetamask: ChainableFn<typeof connectMetamask>
      allocateERC20Tokens: ChainableFn<typeof allocateERC20Tokens>
      allocateEth: ChainableFn<typeof allocateEth>
      balanceOfErc20: ChainableFn<typeof balanceOfErc20>
      inputMaxCollateral: typeof inputMaxCollateral
      inputMaxBorrow: typeof inputMaxBorrow
      approveSpending: typeof approveSpending
      createSofLiquidationLoan: typeof createSofLiquidationLoan
    }
  }
}
