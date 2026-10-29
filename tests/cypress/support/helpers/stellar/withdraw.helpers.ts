import type { StellarContract } from '@/stellar/features/connect-wallet/address'
import { simulateContractCall } from '@/stellar/features/connect-wallet/stellar-wallet-kit/contract'
import { sendStellarTransaction } from '@/stellar/features/connect-wallet/stellar-wallet-kit/transaction'
import { LP_TOKEN_DECIMALS } from '@/stellar/lib/amounts'
import { fetchPoolReserves } from '@/stellar/queries/pool/pool-reserves.query'
import { fetchTokenBalance } from '@/stellar/queries/token/token-balance.query'
import { oneDecimal } from '@cy/support/generators'
import { getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import { seedTestPool } from '@cy/support/helpers/stellar/deposit.helpers'
import { fetchPoolState, poolInput, type PoolState, TEST_NETWORK } from '@cy/support/helpers/stellar/pool.helpers'
import type { TestnetConfig } from '@cy/support/helpers/stellar/stellar-testnet.config'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { decimalMultiply, toWei } from '@ui/lib/decimal'

export const fetchWithdrawState = async (pool: StellarContract, config: TestnetConfig) => {
  const state = await fetchPoolState(pool, config)
  const decimals = state.coins.map(({ decimals }) => decimals)
  return { ...state, reserves: await fetchPoolReserves({ network: TEST_NETWORK, pool, decimals }, { staleTime: 0 }) }
}

export type WithdrawState = Awaited<ReturnType<typeof fetchWithdrawState>>

/** Seed the pool and transfer most LP to the issuer to keep one-coin withdrawal price impact acceptable. */
export const seedPoolAndTransferMostLpToIssuer = async (pool: StellarContract, config: TestnetConfig) => {
  await seedTestPool(pool, config)
  const { issuer, deployer } = config
  const balance = await fetchTokenBalance(
    { network: TEST_NETWORK, token: pool, account: deployer.address, decimals: LP_TOKEN_DECIMALS },
    { staleTime: 0 },
  )
  const amount = decimalMultiply(balance, oneDecimal(0.9, 0.95))
  await sendStellarTransaction(
    await simulateContractCall<void>(
      TEST_NETWORK,
      pool,
      'transfer',
      [deployer.address, issuer.address, BigInt(toWei(amount, LP_TOKEN_DECIMALS))],
      deployer.address,
    ),
  )
}

export const withdrawLpInput = () => cy.get('[data-testid="pool-withdraw-lp-input"]', TIMEOUTS['ui.render'])
export const withdrawSubmit = () => cy.get('[data-testid="pool-withdraw-submit"]', TIMEOUTS['ui.render'])
export const writeWithdrawLp = (amount: Decimal) => {
  withdrawLpInput().find('input', TIMEOUTS['stellar.read']).should('be.enabled').clear()
  withdrawLpInput().find('input').type(amount)
  withdrawLpInput().find('input').blur()
}

type WithdrawDetail = 'current-lp' | 'projected-lp'

export const getWithdrawDetail = (detail: WithdrawDetail) =>
  getActionValue(
    'pool-withdraw-current-lp',
    detail === 'current-lp' ? 'stellar.read' : 'stellar.simulation',
    detail === 'current-lp' ? 'previous' : 'value',
  )

export const checkWithdrawDetail = (detail: WithdrawDetail, amount: Decimal) =>
  getWithdrawDetail(detail).should('equal', formatNumber(amount, 'token.balance'))

export const checkWithdrawBalances = ({ coins, lp }: WithdrawState) => {
  checkWithdrawDetail('current-lp', lp.balance)
  withdrawLpInput().find('[data-testid="balance-value"]').should('have.attr', 'data-value', lp.balance)
  coins.forEach(({ address }) => {
    poolInput(address).find('[data-testid="balance-value"]').should('not.exist')
  })
}

export const selectWithdrawMax = ({ lp }: PoolState, coin: PoolState['coins'][number]) => {
  cy.get('[data-testid="withdraw-token-select"]').click()
  cy.get(`[data-testid="token-option-${coin.address.toLowerCase()}"]`).click()
  poolInput(coin.address).find('[data-testid="input-chip-Max"]', TIMEOUTS['stellar.simulation']).click()
  checkWithdrawDetail('current-lp', lp.balance)
  checkWithdrawDetail('projected-lp', '0')
}

export const checkPartialWithdrawQuote = ({ lp }: PoolState, lpBudget: Decimal) => {
  getWithdrawDetail('projected-lp').should(value => {
    expect(Number(value))
      .to.be.at.least(+lp.balance - +lpBudget)
      .and.lessThan(+lp.balance)
  })
}

export const submitWithdrawForm = () => {
  withdrawSubmit().click()
  cy.get('[data-testid^="pool-token-input-"] input:visible', TIMEOUTS['stellar.confirmation']).should(inputs => {
    inputs.each((_, input) => {
      expect(input).to.have.value('')
    })
  })
  withdrawSubmit().should('be.disabled')
}

export const checkWithdrawResult = (projectedLp: string) => getWithdrawDetail('current-lp').should('equal', projectedLp)

/** Capture the UI preview, submit, and verify the remaining LP balance. */
export const submitWithdrawAndCheck = (state: PoolState) => {
  withdrawSubmit().should('be.enabled')
  return getWithdrawDetail('projected-lp')
    .should(value => expect(Number(value)).to.be.within(0, +state.lp.balance))
    .then(projected => {
      submitWithdrawForm()
      checkWithdrawResult(projected!)
    })
}
