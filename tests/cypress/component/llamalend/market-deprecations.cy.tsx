import { zeroAddress, getAddress } from 'viem'
import { useMarketAlert } from '@/llamalend/features/market-list/hooks/useMarketAlert'
import { DEPRECATED_LLAMAS, MARKETS_ALERTS, NO_LEVERAGE_LEND } from '@/llamalend/llama-markets.constants'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { oneOf, oneValueOf } from '@cy/support/generators'
import type { Address } from '@primitives/address.utils'
import { recordEntries, recordValues } from '@primitives/objects.utils'
import { LlamaMarketType } from '@ui-kit/types/market'
import { Chain } from '@ui-kit/utils'

function MarketAlertHookTest({
  chainId,
  controllerAddress,
  marketType,
}: {
  chainId: IChainId
  controllerAddress: Address | undefined
  marketType: LlamaMarketType
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
  marketType: LlamaMarketType
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
      marketType: oneValueOf(LlamaMarketType),
    })

    cy.get('[data-testid="market-alert-state"]').should('have.text', 'missing')
  })
})
