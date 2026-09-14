import type { StellarAddress, StellarContract } from '@/stellar/features/connect-wallet/address'
import { minimumMint } from '@/stellar/lib/amounts'
import { fetchExpectedLp } from '@/stellar/queries/deposit/deposit-expected-lp.query'
import { fetchPoolConfig } from '@/stellar/queries/pool/pool-config.query'
import { fetchPoolSupply } from '@/stellar/queries/pool/pool-supply.query'
import { fetchTokenBalance } from '@/stellar/queries/token/token-balance.query'
import { fetchTokenDecimals } from '@/stellar/queries/token/token-decimals.query'
import { fetchTokenSymbol } from '@/stellar/queries/token/token-symbol.query'
import type { TestnetConfig } from '@cy/support/helpers/stellar/stellar-testnet.config'
import { LOAD_TIMEOUT, TRANSACTION_LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { useUserProfileStore } from '@ui/features/user-profile'
import { decimalSum } from '@ui/lib/decimal'

export const TEST_NETWORK = 'stellar-testnet'

const fetchToken = async (address: StellarContract, account: StellarAddress) => {
  const params = { network: TEST_NETWORK, token: address, account } as const
  const [decimals, symbol] = await Promise.all([fetchTokenDecimals(params), fetchTokenSymbol(params)])
  const balance = await fetchTokenBalance({ ...params, decimals }, { staleTime: 0 })
  return { ...params, symbol, decimals, balance }
}

export const fetchDepositState = async (pool: StellarContract, { deployer, coins: testCoins }: TestnetConfig) => {
  const poolParams = { network: TEST_NETWORK, pool } as const
  const [coins, lp, supply, config] = await Promise.all([
    Promise.all(testCoins.map(({ address }) => fetchToken(address, deployer.address))),
    fetchToken(pool, deployer.address),
    fetchPoolSupply(poolParams, { staleTime: 0 }),
    fetchPoolConfig(poolParams),
  ])
  return { pool, coins, lp, supply, config }
}
export type DepositState = Awaited<ReturnType<typeof fetchDepositState>>
export type DepositAmounts = Record<string, Decimal>

export const fetchDepositPreview = async ({ pool, coins, lp, supply }: DepositState, amounts: DepositAmounts) => {
  const expected = await fetchExpectedLp({
    network: TEST_NETWORK,
    pool,
    amounts: coins.map(({ symbol }) => amounts[symbol] ?? '0'),
    decimals: coins.map(({ decimals }) => decimals),
    supply,
  })
  return {
    expected,
    minimum: minimumMint(expected, useUserProfileStore.getState().maxSlippage.stable),
    projected: decimalSum(lp.balance, expected),
  }
}

export const depositInput = (symbol: string) =>
  cy.contains('[data-testid^="pool-deposit-input-"]', symbol, LOAD_TIMEOUT)
export const depositSubmit = () => cy.get('[data-testid="pool-deposit-submit"]', LOAD_TIMEOUT)
export const writeDepositForm = (amounts: DepositAmounts) =>
  Object.entries(amounts).forEach(([symbol, amount]) => {
    depositInput(symbol).find('input').clear().type(amount).blur()
  })

export const checkDepositDetail = (label: string, amount: Decimal) =>
  cy
    .contains('[data-testid="action-info"]', label, LOAD_TIMEOUT)
    .find('[data-testid="action-info-value"]')
    .should('have.text', formatNumber(amount, 'token.balance'))

export const checkDepositBalances = ({ coins, lp }: DepositState) => {
  checkDepositDetail('Current LP balance', lp.balance)
  coins.forEach(({ symbol, balance }) => {
    depositInput(symbol).find('[data-testid="balance-value"]').should('have.attr', 'data-value', balance)
  })
}

export const submitDepositForm = ({ coins }: Pick<DepositState, 'coins'>) => {
  depositSubmit().click(LOAD_TIMEOUT)
  cy.get('[data-testid="toast-success"]', TRANSACTION_LOAD_TIMEOUT).should('contain.text', 'Deposit confirmed')
  coins.forEach(({ symbol }) => {
    depositInput(symbol).find('input').should('have.value', '')
  })
  depositSubmit().should('be.disabled')
}
