import type { StellarAddress, StellarContract } from '@/stellar/features/connect-wallet/address'
import { fetchPoolConfig } from '@/stellar/queries/pool/pool-config.query'
import { fetchPoolSupply } from '@/stellar/queries/pool/pool-supply.query'
import { fetchTokenBalance } from '@/stellar/queries/token/token-balance.query'
import { fetchTokenDecimals } from '@/stellar/queries/token/token-decimals.query'
import { fetchTokenSymbol } from '@/stellar/queries/token/token-symbol.query'
import { getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import type { TestnetConfig } from '@cy/support/helpers/stellar/stellar-testnet.config'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'

export const TEST_NETWORK = 'stellar-testnet'

const fetchToken = async (address: StellarContract, account: StellarAddress) => {
  const params = { network: TEST_NETWORK, token: address, account } as const
  const [decimals, symbol] = await Promise.all([fetchTokenDecimals(params), fetchTokenSymbol(params)])
  const balance = await fetchTokenBalance({ ...params, decimals }, { staleTime: 0 })
  return { ...params, address, symbol, decimals, balance }
}

export const fetchPoolState = async (pool: StellarContract, { deployer }: TestnetConfig) => {
  const poolParams = { network: TEST_NETWORK, pool } as const
  const config = await fetchPoolConfig(poolParams)
  const [coins, lp, supply] = await Promise.all([
    Promise.all(config.tokens.map(address => fetchToken(address, deployer.address))),
    fetchToken(pool, deployer.address),
    fetchPoolSupply(poolParams, { staleTime: 0 }),
  ])
  return { coins, lp, supply, config }
}
export type PoolState = Awaited<ReturnType<typeof fetchPoolState>>
export type PoolAmounts = Record<string, Decimal>

export const poolInput = (address: StellarContract) =>
  cy.get(`[data-testid="pool-token-input-${address}"]`, LOAD_TIMEOUT)
/** Reselect after each action because changing an amount can rerender every token input. */
export const writePoolAmount = (address: StellarContract, amount: Decimal | undefined) => {
  poolInput(address).find('input').clear()
  if (amount != null) poolInput(address).find('input').type(amount)
  poolInput(address).find('input').blur()
}

export const checkPoolGasEstimate = () => {
  cy.get('[data-testid="estimated-tx-cost-value"]', LOAD_TIMEOUT).should('be.visible')
  getActionValue('estimated-tx-cost').should(value => {
    expect(value).to.include('XLM')
    expect(Number.parseFloat(value!)).to.be.greaterThan(0)
  })
}

export const writePoolForm = (coins: Pick<PoolState['coins'][number], 'address' | 'symbol'>[], amounts: PoolAmounts) =>
  coins.forEach(({ address, symbol }) => {
    const amount = amounts[symbol]
    if (amount != null) {
      writePoolAmount(address, amount)
    }
  })

export const checkPoolInputError = (address: StellarContract, message: string) =>
  poolInput(address).find('[data-testid="helper-message-error"]').should('be.visible').and('contain.text', message)

export const readPoolAmounts = (coins: PoolState['coins']) => {
  let amounts: Decimal[] = []
  coins.forEach(({ address }) => {
    poolInput(address)
      .find('input')
      .should('not.have.value', '')
      .invoke('val')
      .then(value => {
        amounts = [...amounts, String(value) as Decimal]
      })
  })
  return cy.then(() => amounts)
}
