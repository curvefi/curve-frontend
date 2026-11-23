import { type Address, createPublicClient, erc20Abi, formatUnits, http, parseUnits } from 'viem'
import { getPoolUnderlyingBalances, type TestPool } from '@cy/support/helpers/dex/curve.helpers'
import { getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import { submitAndExpectToast } from '@cy/support/helpers/toast.helpers'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import { cyMap } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { decimal, ZERO } from '@ui/lib/decimal'

export const poolDepositInput = (tokenAddress: Address) =>
  cy.get(`[data-testid="pool-token-input-${tokenAddress}"] input[type="text"]`, TIMEOUTS['ui.render'])

export const poolDepositSubmit = () => cy.get('[data-testid="pool-deposit-submit"]', TIMEOUTS['ui.render'])

export const writePoolDepositForm = (amounts: readonly Decimal[], { coins }: TestPool) =>
  coins.map(({ address }, index) => {
    poolDepositInput(address).clear()
    if (Number(amounts[index])) poolDepositInput(address).type(amounts[index])
    poolDepositInput(address).blur()
  })

export const checkPoolDepositDetailsLoaded = () => {
  getActionValue('pool-deposit-expected-lp', 'tenderly.simulation').should(value =>
    expect(Number(value)).to.be.greaterThan(0),
  )
  getActionValue('pool-deposit-minimum-lp', 'tenderly.simulation').should(value =>
    expect(Number(value)).to.be.greaterThan(0),
  )
  getActionValue('pool-price-impact', 'tenderly.simulation').should('include', '%')
  // The gas value can use the native token when USD prices are unavailable.
  getActionValue('estimated-tx-cost', 'tenderly.simulation').should('be.a', 'string').and('not.be.empty')
  poolDepositSubmit().should('be.enabled').and('have.text', 'Deposit')
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}

export const getPoolDepositAllowance = ({
  publicRpcUrl,
  userAddress,
  tokenAddress,
  pool: { depositAddress },
}: {
  publicRpcUrl: string
  userAddress: Address
  tokenAddress: Address
  pool: TestPool
}) =>
  cy.then(TIMEOUTS['tenderly.allowance'], () =>
    createPublicClient({ transport: http(publicRpcUrl) }).readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [userAddress, depositAddress],
    }),
  )

/** Submit through the form, then verify actual token debits, LP minting and refreshed wallet balances. */
export const submitPoolDepositAndCheck = ({
  publicRpcUrl,
  userAddress,
  amounts,
  pool: { coins, lpToken },
  tokenIndex,
}: {
  publicRpcUrl: string
  userAddress: Address
  amounts: readonly Decimal[]
  pool: TestPool
  tokenIndex?: number
}) => {
  const client = createPublicClient({ transport: http(publicRpcUrl) })
  const readBalances = () =>
    Promise.all(
      [...coins.map(coin => coin.address), lpToken].map(address =>
        client.readContract({ address, abi: erc20Abi, functionName: 'balanceOf', args: [userAddress] }),
      ),
    )

  return cy.then(TIMEOUTS['tenderly.balances'], readBalances).then(before => {
    submitAndExpectToast(
      () => poolDepositSubmit().click(),
      { message: 'Deposit successful!', approvalMessage: 'Approved deposit' },
      'tenderly.submit',
    )
    coins.map(({ address }, index) => {
      if (tokenIndex == null || index === tokenIndex) poolDepositInput(address).should('have.value', '')
    })
    poolDepositSubmit().should('be.disabled')

    cy.then(TIMEOUTS['tenderly.balances'], readBalances).then(after => {
      coins.map((coin, index) => {
        const spent = parseUnits(amounts[index], coin.decimals)
        expect(before[index] - after[index], `${coin.symbol} spent`).to.equal(spent)
        const { address, decimals } = coin
        if (tokenIndex == null || index === tokenIndex)
          cy.get(
            `[data-testid="pool-token-input-${address}"] [data-testid="balance-value"]`,
            TIMEOUTS['tenderly.balances'],
          ).should(v => expect(v.attr('data-value')).to.equal(formatUnits(after[index], decimals)))
      })
      const lpIndex = coins.length
      expect(after[lpIndex] > before[lpIndex], 'LP tokens received').to.equal(true)
    })
  })
}

/** Read amounts selected by the balanced checkbox or Max chip without rounding the displayed input. */
export const getPoolDepositAmounts = ({ coins }: TestPool) =>
  cyMap(coins, ({ address }) =>
    poolDepositInput(address)
      .invoke('attr', 'data-value')
      .then(v => decimal(v) ?? ZERO),
  )

/** Compare selected amounts against on-chain reserve ratios, allowing one base unit for rounding. */
export const checkBalancedPoolDepositAmounts = ({
  amounts,
  pool: { coins, address },
}: {
  amounts: readonly Decimal[]
  pool: TestPool
}) =>
  getPoolUnderlyingBalances(address)
    .then(balances => balances.map((balance, index) => parseUnits(balance, coins[index].decimals)))
    .then(reserves => {
      cy.get('[data-testid^="pool-token-input-"] [data-testid="balance-value"]', TIMEOUTS['tenderly.balances'])
        .should('have.length', coins.length)
        .then(balances => {
          const walletBalances = Array.from(balances, balance => balance.getAttribute('data-value')!)
          const limitingIndex = amounts.findIndex(
            (amount, index) =>
              Number(walletBalances[index]) > 0 &&
              parseUnits(amount, coins[index].decimals) === parseUnits(walletBalances[index], coins[index].decimals),
          )
          expect(limitingIndex, 'one coin uses the maximum wallet balance').to.be.at.least(0)
          const limitingAmount = parseUnits(walletBalances[limitingIndex], coins[limitingIndex].decimals)
          coins.forEach(({ decimals, symbol }, index) => {
            const amount = parseUnits(amounts[index], decimals)
            const balance = parseUnits(walletBalances[index], decimals)
            expect(amount > 0n && amount <= balance, `${symbol} is within its wallet balance`).to.equal(true)
            const expected = (reserves[index] * limitingAmount) / reserves[limitingIndex]
            const difference = amount > expected ? amount - expected : expected - amount
            expect(
              difference <= 1n,
              `${symbol} follows pool reserve proportions: expected ${formatUnits(expected, decimals)}, got ${amounts[index]}`,
            ).to.equal(true)
          })
        })
    })
