import { parseUnits, toHex } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { SwapTab } from '@/dex/features/swap/components/SwapTab'
import { oneBool, oneDecimal, oneOf } from '@cy/support/generators'
import { TEST_ETH_FUND_AMOUNT, TEST_POOLS, TEST_SLIPPAGE } from '@cy/support/helpers/dex/curve.helpers'
import { PoolTestCase } from '@cy/support/helpers/dex/PoolTestCase'
import {
  checkPoolSwapDetails,
  poolSwapAmount,
  poolSwapInput,
  poolSwapSubmit,
  selectPoolSwapCoin,
  submitPoolSwapAndCheck,
  writePoolSwapAmount,
} from '@cy/support/helpers/dex/swap.helpers'
import { createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import { fundErc20, fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import { skipTestsAfterFailure } from '@cy/support/ui'
import { Chain } from '@primitives/network.utils'
import { DEFAULT_DECIMALS } from '@primitives/units.util'
import { constQ } from '@ui/features/queries/util'

const FUND_AMOUNT = '100'
const SWAP_AMOUNT_RANGE = [1, 5] as const

describe('Pool Swap (RPC)', () => {
  skipTestsAfterFailure()

  const chainId = Chain.Ethereum
  const privateKey = generatePrivateKey()
  const { address: userAddress } = privateKeyToAccount(privateKey)
  const getVirtualNetwork = createVirtualTestnet(uuid => ({
    slug: `pool-swap-integration-${uuid}`,
    display_name: `PoolSwapIntegration (${uuid})`,
    chain_id: chainId,
    fork_config: { block_number: 'latest' },
  }))

  const pool = oneOf(...TEST_POOLS)
  const isWrapped = !!pool.wrappedCoins && oneBool()
  const coins = isWrapped ? pool.wrappedCoins! : pool.coins
  const from = oneOf(...coins)
  const to = oneOf(...coins.filter(coin => coin.address !== from.address))
  const side = oneOf('pay', 'receive')
  const amount = oneDecimal(...SWAP_AMOUNT_RANGE, Math.min(from.decimals, to.decimals))

  before(() => {
    cy.task(
      'log',
      `Swap test pool: ${pool.id}, wrapped: ${isWrapped}, ${side}: ${amount}, ${from.symbol} → ${to.symbol}`,
    )
    const { adminRpcUrl } = getRpcUrls(getVirtualNetwork())
    fundEth({
      adminRpcUrl,
      amountWei: toHex(parseUnits(TEST_ETH_FUND_AMOUNT, DEFAULT_DECIMALS)),
      recipientAddresses: [userAddress],
    })
    coins.map(({ address, decimals }) =>
      fundErc20({
        adminRpcUrl,
        tokenAddress: address,
        amountWei: toHex(parseUnits(FUND_AMOUNT, decimals)),
        recipientAddresses: [userAddress],
      }),
    )
  })

  it('quotes, approves and swaps an amount, then refreshes wallet balances', () => {
    cy.mount(
      <PoolTestCase vnet={getVirtualNetwork()} account={privateKey} chainId={chainId} poolAddress={pool.address}>
        <SwapTab
          maxSlippage={TEST_SLIPPAGE}
          poolAlert={null}
          seed={constQ(false)}
          params={{ network: 'ethereum', poolAddress: pool.address }}
        />
      </PoolTestCase>,
    )
    if (isWrapped) cy.get('[data-testid="pool-swap-wrapped-checkbox"] input').check()
    selectPoolSwapCoin('pay', from.address)
    selectPoolSwapCoin('receive', to.address)
    ;(['pay', 'receive'] as const).forEach(side => {
      poolSwapInput(side)
        .find('[role="combobox"]')
        .should('contain.text', (side === 'pay' ? from : to).symbol)
      poolSwapInput(side)
        .find('[data-testid="balance-value"]', TIMEOUTS['tenderly.balances'])
        .should('have.attr', 'data-value', FUND_AMOUNT)
    })
    poolSwapInput('pay').find('[data-testid="input-chip-Max"]').click()
    poolSwapAmount('pay').should('have.attr', 'data-value', FUND_AMOUNT)
    writePoolSwapAmount(side, amount)
    poolSwapSubmit().should('be.enabled')
    poolSwapAmount(side).should('have.attr', 'data-value', amount)
    checkPoolSwapDetails(from.symbol, to.symbol)
    submitPoolSwapAndCheck()
  })
})
