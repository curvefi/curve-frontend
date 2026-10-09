import { type Address, createPublicClient, erc20Abi, formatUnits, http, parseUnits } from 'viem'
import { getActionValue } from '@cy/support/helpers/llamalend/action-info.helpers'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import { cyMap } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { decimal, ZERO } from '@ui/lib/decimal'

export const DEPOSIT_TEST_POOLS = [
  {
    id: '3pool',
    address: '0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7',
    lpToken: '0x6c3f90f043a72fa612cbac8115ee7e52bde6e490',
    coins: [
      { address: '0x6b175474e89094c44da98b954eedeac495271d0f', symbol: 'DAI', decimals: 18 },
      { address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', symbol: 'USDC', decimals: 6 },
      { address: '0xdac17f958d2ee523a2206206994597c13d831ec7', symbol: 'USDT', decimals: 6 },
    ],
  },
] as const

export type DepositTestPool = (typeof DEPOSIT_TEST_POOLS)[number]

export const poolDepositInput = (tokenAddress: Address) =>
  cy.get(`[data-testid="pool-token-input-${tokenAddress}"] input[type="text"]`, TIMEOUTS['ui.render'])

export const poolDepositSubmit = () => cy.get('[data-testid="pool-deposit-submit"]', TIMEOUTS['ui.render'])

export const writePoolDepositForm = (amounts: readonly Decimal[], { coins }: DepositTestPool) =>
  coins.forEach(({ address }, index) => {
    poolDepositInput(address).clear()
    if (Number(amounts[index])) poolDepositInput(address).type(amounts[index])
    poolDepositInput(address).blur()
  })

export const checkPoolDepositDetailsLoaded = () => {
  getActionValue('pool-deposit-expected-lp', 'evm.simulation').should(value =>
    expect(Number(value)).to.be.greaterThan(0),
  )
  getActionValue('pool-deposit-minimum-lp', 'evm.simulation').should(value =>
    expect(Number(value)).to.be.greaterThan(0),
  )
  getActionValue('pool-price-impact', 'evm.simulation').should('include', '%')
  // The gas value can use the native token when USD prices are unavailable.
  getActionValue('estimated-tx-cost', 'evm.simulation').should('be.a', 'string').and('not.be.empty')
  poolDepositSubmit().should('be.enabled').and('have.text', 'Deposit')
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
}

export const getPoolDepositAllowance = ({
  publicRpcUrl,
  userAddress,
  tokenAddress,
  pool: { address },
}: {
  publicRpcUrl: string
  userAddress: Address
  tokenAddress: Address
  pool: DepositTestPool
}) =>
  cy.then(TIMEOUTS['evm.contractRead'], () =>
    createPublicClient({ transport: http(publicRpcUrl) }).readContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'allowance',
      args: [userAddress, address],
    }),
  )

/** Submit through the form, then verify actual token debits, LP minting and refreshed wallet balances. */
export const submitPoolDepositAndCheck = ({
  publicRpcUrl,
  userAddress,
  amounts,
  pool: { coins, lpToken },
}: {
  publicRpcUrl: string
  userAddress: Address
  amounts: readonly Decimal[]
  pool: DepositTestPool
}) => {
  const client = createPublicClient({ transport: http(publicRpcUrl) })
  const readBalances = () =>
    Promise.all(
      [...coins.map(coin => coin.address), lpToken].map(address =>
        client.readContract({ address, abi: erc20Abi, functionName: 'balanceOf', args: [userAddress] }),
      ),
    )

  return cy.then(TIMEOUTS['evm.balances'], readBalances).then(before => {
    poolDepositSubmit().click()
    cy.get('[data-testid="toast-success"]', TIMEOUTS['evm.confirmation']).should('contain.text', 'Deposit successful!')
    coins.forEach(({ address }) => {
      poolDepositInput(address).should('have.value', '')
    })
    poolDepositSubmit().should('be.disabled')

    cy.then(TIMEOUTS['evm.balances'], readBalances).then(after => {
      coins.forEach((coin, index) => {
        const spent = parseUnits(amounts[index], coin.decimals)
        expect(before[index] - after[index], `${coin.symbol} spent`).to.equal(spent)
        const { address, decimals } = coin
        cy.get(
          `[data-testid="pool-token-input-${address}"] [data-testid="balance-value"]`,
          TIMEOUTS['evm.balances'],
        ).should(v => expect(v.attr('data-value')).to.equal(formatUnits(after[index], decimals)))
      })
      const lpIndex = coins.length
      expect(after[lpIndex] > before[lpIndex], 'LP tokens received').to.equal(true)
    })
  })
}

/** Read amounts selected by the balanced checkbox or Max chip without rounding the displayed input. */
export const getPoolDepositAmounts = ({ coins }: DepositTestPool) =>
  cyMap(coins, ({ address }) =>
    poolDepositInput(address)
      .invoke('attr', 'data-value')
      .then(v => decimal(v) ?? ZERO),
  )

/** Compare selected amounts against on-chain reserve ratios, allowing one base unit for rounding. */
export const checkBalancedPoolDepositAmounts = ({
  publicRpcUrl,
  amounts,
  pool: { coins, address },
}: {
  publicRpcUrl: string
  amounts: readonly Decimal[]
  pool: DepositTestPool
}) =>
  cy
    .then(TIMEOUTS['evm.contractRead'], async () => {
      const client = createPublicClient({ transport: http(publicRpcUrl) })
      return await Promise.all(
        coins.map((_, index) =>
          client.readContract({
            address,
            abi: [
              {
                name: 'balances',
                type: 'function',
                stateMutability: 'view',
                inputs: [{ type: 'uint256' }],
                outputs: [{ type: 'uint256' }],
              },
            ] as const,
            functionName: 'balances',
            args: [BigInt(index)],
          }),
        ),
      )
    })
    .then(reserves => {
      cy.get('[data-testid^="pool-token-input-"] [data-testid="balance-value"]', TIMEOUTS['evm.balances'])
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
