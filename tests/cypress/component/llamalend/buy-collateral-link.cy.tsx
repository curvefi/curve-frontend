import { useConnection } from 'wagmi'
import { BuyCollateralLink } from '@/llamalend/features/borrow/components/BuyCollateralLink'
import { fetchTokenMetadata } from '@/llamalend/queries/token-metadata.query'
import { oneOf } from '@cy/support/generators'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { TEST_ADDRESS } from '@cy/support/helpers/llamalend/mock-loan-test-data'
import { seedErc20BalanceForAddresses } from '@cy/support/helpers/llamalend/query-cache.helpers'
import { mockedWagmiConfig } from '@cy/support/helpers/llamalend/test-wagmi.helpers'
import { TIMEOUTS } from '@cy/support/timeout-categories'
import type { Token } from '@primitives/address.utils'
import { Chain } from '@primitives/network.utils'
import { disconnect } from '@wagmi/core'

const LP_LEND_COLLATERAL: Token = { symbol: 'reusdsfrx', address: '0xed785Af60bEd688baa8990cD5c4166221599A441' }
// older pools have an LP token that is not the pool itself
const OLD_LP_TOKEN: Token = { symbol: '3Crv', address: '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490' }
const OLD_LP_POOL = '0xbEbc44782C7dB0a1A60Cb6fe97d0b483032FF1C7'
const LEND_COLLATERAL: Token = { symbol: 'sreUSD', address: '0x557ab1e003951a73c12d16f0fea8490e39c33c35' }
const MINT_COLLATERAL: Token = { symbol: 'WBTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' }

const swapUrl = ({ address }: Token) => `/dex/ethereum/swap?to=${address}`

type TestCase = { title: string; token: Token; href?: string; balance?: bigint; connected?: boolean }

const testCases: TestCase[] = [
  oneOf(
    {
      title: 'links the LP lend market collateral to its pool',
      token: LP_LEND_COLLATERAL,
      href: `/dex/ethereum/pools/${LP_LEND_COLLATERAL.address}`,
    },
    { title: 'links an older LP token to its pool', token: OLD_LP_TOKEN, href: `/dex/ethereum/pools/${OLD_LP_POOL}` },
    {
      title: 'links the lend market collateral to the swap page',
      token: LEND_COLLATERAL,
      href: swapUrl(LEND_COLLATERAL),
    },
    {
      title: 'links the mint market collateral to the swap page',
      token: MINT_COLLATERAL,
      href: swapUrl(MINT_COLLATERAL),
    },
  ),
  { title: 'hides the link when the user holds collateral', token: LP_LEND_COLLATERAL, balance: 1n },
  { title: 'hides the link without a connected wallet', token: LP_LEND_COLLATERAL, connected: false },
]

const WalletStatus = () => <span data-testid="wallet-status">{useConnection().status}</span>

describe('BuyCollateralLink', () => {
  testCases.forEach(({ title, token, href, balance = 0n, connected = true }) =>
    it(title, () => {
      // the token and balance are loaded before mounting, so hidden links are checked after they could have rendered
      cy.then(TIMEOUTS['prices.tokens'], () =>
        fetchTokenMetadata({ blockchainId: 'ethereum', tokenAddress: token.address }),
      )
      seedErc20BalanceForAddresses({
        chainId: Chain.Ethereum,
        tokenAddress: token.address,
        addresses: [TEST_ADDRESS],
        rawBalance: balance,
      })
      // the wagmi config is shared between tests, so the wallet stays connected unless disconnected explicitly
      if (!connected) cy.then(() => disconnect(mockedWagmiConfig))
      cy.mount(
        <ComponentTestWrapper config={mockedWagmiConfig} autoConnect={connected}>
          <>
            <WalletStatus />
            <BuyCollateralLink chainId={Chain.Ethereum} blockchainId="ethereum" token={token} />
          </>
        </ComponentTestWrapper>,
      )
      cy.get('[data-testid="wallet-status"]', TIMEOUTS['ui.render']).should(
        'have.text',
        connected ? 'connected' : 'disconnected',
      )
      const link = cy.get('[data-testid="buy-collateral-link"]')
      if (href) link.should('have.attr', 'href', href)
      else link.should('not.exist')
    }),
  )
})
