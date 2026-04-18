import { zeroAddress } from 'viem'
import {
  useMarketAlert,
  LEND_MARKETS_ALERTS,
  MINT_MARKETS_ALERTS,
} from '@/llamalend/features/market-list/hooks/useMarketAlert'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { oneOf } from '@cy/support/generators'
import type { Address } from '@primitives/address.utils'
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

const ALL_MARKET_ALERTS = [LEND_MARKETS_ALERTS, MINT_MARKETS_ALERTS] as const

const LEND_ALERT_CASES = Object.entries(LEND_MARKETS_ALERTS).flatMap(([chainId, chainAlerts]) =>
  Object.entries(chainAlerts).map(([controllerAddress, alert]) => ({
    chainId: Number(chainId) as IChainId,
    controllerAddress: controllerAddress as Address,
    alertType: alert.alertType,
  })),
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

  it(`returns the correct alert for lend checksummed addresses`, () => {
    const alert = oneOf(...LEND_ALERT_CASES)
    mountMarketAlert({
      chainId: alert.chainId,
      controllerAddress: alert.controllerAddress.toUpperCase() as Address,
      marketType: LlamaMarketType.Lend,
    })

    cy.get('[data-testid="market-alert-state"]').should('have.text', alert.alertType)
  })

  it('returns no alert when the chain has no configured alerts', () => {
    mountMarketAlert({
      chainId: Chain.Avalanche as IChainId,
      controllerAddress: zeroAddress,
      marketType: LlamaMarketType.Lend,
    })

    cy.get('[data-testid="market-alert-state"]').should('have.text', 'missing')
  })
})
