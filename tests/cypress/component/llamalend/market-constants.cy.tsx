import { zeroAddress, getAddress } from 'viem'
import { useMarketAlert } from '@/llamalend/features/market-list/hooks/useMarketAlert'
import { getMarketLeverageProviders, getMarketLeverageSlippage } from '@/llamalend/llama.utils'
import { DEPRECATED_LLAMAS, MARKETS_ALERTS, NO_LEVERAGE_LEND, ZAPV2_MARKET_CONFIG } from '@/llamalend/markets.constants'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { oneOf, oneValueOf } from '@cy/support/generators'
import type { Address } from '@primitives/address.utils'
import { recordEntries, recordValues } from '@primitives/objects.utils'
import { RouteProviders } from '@primitives/router.utils'
import { MarketType } from '@ui-kit/types/market'
import { Chain, ReleaseChannel } from '@ui-kit/utils'
import { SLIPPAGE } from '@ui-kit/widgets/SlippageSettings/slippage.utils'

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
const STABLE_LEVERAGE_MARKETS = {
  [Chain.Ethereum]: ['0x2fb54c8eae57767A9A509A395b9C4FA0702e2675', '0xC77d97cF01737EB7aCE46cAb7cd9F60eC51a40c0'],
  [Chain.Optimism]: ['0x745422BF49f3F6e4A8E12E4abD19339E7910F8C9'],
} as const

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
    for (const chainMarkets of recordValues(ZAPV2_MARKET_CONFIG)) {
      for (const [controllerAddress, { providers }] of Object.entries(chainMarkets)) {
        expect(controllerAddress, `expected address to be checksummed`).to.eq(getAddress(controllerAddress))
        expect(providers.length, `${controllerAddress} must enable at least one provider`).to.be.greaterThan(0)
        expect(providers.every(provider => RouteProviders.includes(provider))).to.eq(true)
      }
    }
  })

  it('gets the configured market slippage with a leverage fallback', () => {
    for (const [chainId, controllerAddresses] of recordEntries(STABLE_LEVERAGE_MARKETS)) {
      for (const controllerAddress of controllerAddresses) {
        expect(getMarketLeverageSlippage(Number(chainId), controllerAddress)).to.eq(SLIPPAGE.stable.default)
      }
    }
    expect(getMarketLeverageSlippage(Chain.Ethereum, zeroAddress)).to.eq(SLIPPAGE.leverage.default)
  })

  it('resolves configured market providers by release channel and defaults unknown markets to none', () => {
    const controller = STABLE_LEVERAGE_MARKETS[Chain.Ethereum][0]
    expect(getMarketLeverageProviders(Chain.Ethereum, controller, ReleaseChannel.Beta)).to.deep.eq(RouteProviders)
    expect(getMarketLeverageProviders(Chain.Ethereum, controller, ReleaseChannel.Stable)).to.deep.eq(['enso'])
    expect(getMarketLeverageProviders(Chain.Ethereum, zeroAddress, ReleaseChannel.Beta)).to.deep.eq([])
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
