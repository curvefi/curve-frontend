import { zeroAddress } from 'viem'
import { useMarketAlert, MARKETS_ALERTS } from '@/llamalend/features/market-list/hooks/useMarketAlert'
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

describe('useMarketAlert', () => {
  it('keeps every configured market alert key lowercase', () => {
    for (const alerts of ALL_MARKET_ALERTS) {
      for (const chainAlerts of Object.values(alerts)) {
        for (const controllerAddress of Object.keys(chainAlerts)) {
          expect(controllerAddress, `expected ${controllerAddress} to be lowercase`).to.eq(
            controllerAddress.toLowerCase(),
          )
        }
      }
    }
  })

  it(`returns the correct alert for checksummed addresses`, () => {
    const alert = oneOf(...ALERT_CASES)
    mountMarketAlert({
      chainId: alert.chainId,
      controllerAddress: alert.controllerAddress.toUpperCase() as Address,
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
