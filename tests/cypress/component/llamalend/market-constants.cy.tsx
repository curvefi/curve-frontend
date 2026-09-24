import { zeroAddress, getAddress } from 'viem'
import { useMarketAlert } from '@/llamalend/features/market-list/hooks/useMarketAlert'
import { getMarketLeverageProviders, getMarketLeverageSlippage } from '@/llamalend/llama.utils'
import { getMarketAddressesByAssetsType } from '@/llamalend/market-assets-type.utils'
import {
  DEPRECATED_LLAMAS,
  // eslint-disable-next-line no-restricted-imports
  MARKET_ASSETS_TYPE_BY_CONTROLLER,
  MARKETS_ALERTS,
  MARKETS_LEVERAGE_CONFIG,
  NO_LEVERAGE_LEND,
} from '@/llamalend/markets.constants'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { oneOf, oneValueOf } from '@cy/support/generators'
import { MarketAssetsType, MarketType } from '@evm-ui/types/market'
import type { Address } from '@primitives/address.utils'
import { Chain } from '@primitives/network.utils'
import { recordEntries, recordValues } from '@primitives/objects.utils'
import { RouteProviders } from '@primitives/router.utils'
import { SLIPPAGE } from '@ui/features/forms/slippage/slippage.utils'
import { ReleaseChannel } from '@ui/lib/env'

// Ethereum Lend market: sfrxUSD/crvUSD v2.
const PROVIDER_TEST_CONTROLLER = '0x3cD4d86a2c65e57ce4b4121b67E2D2224BA41bbe'

function MarketAlertHookTest({
  chainId,
  controllerAddress,
  marketType,
}: {
  chainId: IChainId
  controllerAddress: Address | undefined
  marketType: MarketType
}) {
  const marketAlert = useMarketAlert(chainId, controllerAddress, marketType)

  return <div data-testid="market-alert-state">{marketAlert?.alertType ?? 'missing'}</div>
}

const mountMarketAlert = ({
  chainId,
  controllerAddress,
  marketType,
}: {
  chainId: IChainId
  controllerAddress: Address | undefined
  marketType: MarketType
}) => cy.mount(<MarketAlertHookTest chainId={chainId} controllerAddress={controllerAddress} marketType={marketType} />)

const ALL_MARKET_ALERTS = recordValues(MARKETS_ALERTS)
const ALL_DEPRECATED_LLAMAS = recordValues(DEPRECATED_LLAMAS)
/** Get a list of all alerts for each market type, and chain */
const ALERT_CASES = recordEntries(MARKETS_ALERTS).flatMap(([marketType, marketAlerts]) =>
  recordEntries(marketAlerts).flatMap(([chainId, chainAlerts]) =>
    recordEntries(chainAlerts).map(([controllerAddress, alert]) => ({
      marketType,
      chainId: Number(chainId) as IChainId,
      controllerAddress,
      alertType: alert.alertType,
    })),
  ),
)

describe('llama market constants', () => {
  it('keeps every configured market alert key checksummed', () => {
    for (const alerts of ALL_MARKET_ALERTS) {
      for (const chainAlerts of Object.values(alerts)) {
        for (const controllerAddress of Object.keys(chainAlerts)) {
          expect(controllerAddress, `expected address to be checksummed`).to.eq(getAddress(controllerAddress))
        }
      }
    }
  })
  it('keeps every deprecated llama address checksummed', () => {
    for (const deprecatedMarkets of ALL_DEPRECATED_LLAMAS) {
      for (const chainMarkets of Object.values(deprecatedMarkets)) {
        for (const controllerAddress of Object.keys(chainMarkets)) {
          expect(controllerAddress, `expected address to be checksummed`).to.eq(getAddress(controllerAddress))
        }
      }
    }
  })

  it('keeps every no leverage lend address checksummed', () => {
    for (const chainMarkets of recordValues(NO_LEVERAGE_LEND)) {
      for (const controllerAddress of chainMarkets) {
        expect(controllerAddress, `expected address to be checksummed`).to.eq(getAddress(controllerAddress))
      }
    }
  })

  it('keeps every ZapV2 market address checksummed', () => {
    for (const chainMarkets of recordValues(MARKETS_LEVERAGE_CONFIG)) {
      for (const [controllerAddress, { providers }] of Object.entries(chainMarkets)) {
        expect(controllerAddress, `expected address to be checksummed`).to.eq(getAddress(controllerAddress))
        expect(providers.length, `${controllerAddress} must enable at least one provider`).to.be.greaterThan(0)
        expect(providers.every(provider => RouteProviders.includes(provider))).to.eq(true)
      }
    }
  })

  it('keeps every market assets type address checksummed', () => {
    for (const chainMarkets of recordValues(MARKET_ASSETS_TYPE_BY_CONTROLLER)) {
      for (const [controllerAddress] of recordEntries(chainMarkets)) {
        expect(controllerAddress, `expected address to be checksummed`).to.eq(getAddress(controllerAddress))
      }
    }
  })

  for (const [assetsType, expectedSlippage] of [
    [MarketAssetsType.Correlated, SLIPPAGE.stable.default],
    [MarketAssetsType.Volatile, SLIPPAGE.leverage.default],
    [MarketAssetsType.LongTail, SLIPPAGE.leverage.default],
  ] as const) {
    it(`uses the expected leverage slippage for ${assetsType} markets`, () => {
      const addresses = getMarketAddressesByAssetsType(assetsType)
      for (const [chainId, chainMarkets] of recordEntries(MARKET_ASSETS_TYPE_BY_CONTROLLER)) {
        for (const address of addresses.filter(address => chainMarkets[address] === assetsType)) {
          expect(getMarketLeverageSlippage(Number(chainId), address)).to.eq(expectedSlippage)
        }
      }
    })
  }

  it('resolves configured market providers by release channel', () => {
    expect(getMarketLeverageProviders(Chain.Ethereum, PROVIDER_TEST_CONTROLLER, ReleaseChannel.Beta)).to.deep.eq(
      RouteProviders,
    )
    expect(getMarketLeverageProviders(Chain.Ethereum, PROVIDER_TEST_CONTROLLER, ReleaseChannel.Stable)).to.deep.eq([
      'enso',
      'curve-solver',
      'curve',
    ])
    expect(getMarketLeverageProviders(Chain.Ethereum, zeroAddress, ReleaseChannel.Beta)).to.eq(undefined)
  })
})

describe('useMarketAlert', () => {
  it(`returns the correct alert for checksummed addresses`, () => {
    const alert = oneOf(...ALERT_CASES)
    mountMarketAlert({
      chainId: alert.chainId,
      controllerAddress: alert.controllerAddress,
      marketType: alert.marketType,
    })

    cy.get('[data-testid="market-alert-state"]').should('have.text', alert.alertType)
  })

  it('returns no alert when the chain has no configured alerts', () => {
    mountMarketAlert({
      chainId: Chain.Avalanche as IChainId,
      controllerAddress: zeroAddress,
      marketType: oneValueOf(MarketType),
    })

    cy.get('[data-testid="market-alert-state"]').should('have.text', 'missing')
  })
})
