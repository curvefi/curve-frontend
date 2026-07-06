import { useMarketParameters } from '@/llamalend/queries/market'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { fallbackQ, mapQuery, type QueryProp } from '@ui-kit/types/util'
import { formatNumber } from '@ui-kit/utils'

// In [1]: ltv = lambda x: ((x[0] - 1) / x[0])**2 * (1 - x[1])
// In [2]: ltv((30, 0.11))
// Out[2]: 0.8316555555555556
// where x[0] is A, x[1] is loan discount normalised between 0 and 1 (so 11% is 0.11). multiply ltv by 100 to show percentage.
// always show 'max ltv' which is the max possible loan at N=4 (not advisable but hey it exists!).
function getMaxLTV(a: number | undefined, loanDiscount: string | undefined) {
  if (a == null || loanDiscount == null) return
  return ((+a - 1) / +a) ** 2 * (1 - +loanDiscount / 100) * 100
}

export const MarketLoanParameters = ({
  chainId,
  marketId,
  apiMarket,
}: {
  chainId: IChainId
  marketId: string | undefined
  apiMarket: QueryProp<LlamaMarket>
}) => {
  const parameters = useMarketParameters({ chainId, marketId })
  return (
    <>
      {(!apiMarket.data || marketId) && (
        // these fields are not exposed by the API yet
        <>
          <ActionInfo
            testId="market-param-amm-swap-fee"
            label={t`AMM swap fee`}
            labelTooltip={{
              title: t`The LLAMMA fee applied when collateral is gradually converted across liquidation bands.`,
            }}
            value={mapQuery(
              mapQuery(parameters, d => d.fee),
              value => formatNumber(value, 'percent.rate'),
            )}
          />

          <ActionInfo
            testId="market-param-admin-fee"
            label={t`Admin fee`}
            labelTooltip={{
              title: t`The share of market interest routed to the market admin or fee receiver instead of lenders.`,
            }}
            value={mapQuery(
              mapQuery(parameters, d => d.admin_fee),
              value => formatNumber(value, 'percent.rate'),
            )}
          />
        </>
      )}

      <ActionInfo
        testId="market-param-band-width-factor"
        label={t`Band width factor`}
        labelTooltip={{
          title: t`A setting that controls how wide the liquidation bands are and how gradually soft liquidation plays out.`,
        }}
        value={mapQuery(
          fallbackQ(
            mapQuery(parameters, p => p.A),
            mapQuery(apiMarket, m => m.parameters.A),
          ),
          value => formatNumber(value, { abbreviate: false, useGrouping: false }),
        )}
      />

      <ActionInfo
        testId="market-param-loan-discount"
        label={t`Loan discount`}
        labelTooltip={{ title: t`A safety buffer that lowers the maximum amount you can borrow against collateral.` }}
        value={mapQuery(
          fallbackQ(
            mapQuery(parameters, p => p.loan_discount),
            mapQuery(apiMarket, m => m.parameters.loanDiscount),
          ),
          value => formatNumber(value, 'percent.rate'),
        )}
      />

      <ActionInfo
        testId="market-param-liquidation-discount"
        label={t`Liquidation discount`}
        labelTooltip={{
          title: t`A discount given to liquidators to ensure prompt liquidation when positions enter hard liquidations.`,
        }}
        value={mapQuery(
          fallbackQ(
            mapQuery(parameters, p => p.liquidation_discount),
            mapQuery(apiMarket, m => m.parameters.liquidationDiscount),
          ),
          value => formatNumber(value, 'percent.rate'),
        )}
      />

      <ActionInfo
        testId="market-param-max-ltv"
        label={t`Max LTV`}
        labelTooltip={{ title: t`The highest loan-to-value ratio allowed when opening or increasing a position.` }}
        valueTooltip={t`Max possible loan at N=4`}
        value={mapQuery(
          fallbackQ(
            mapQuery(parameters, ({ A, loan_discount }) => getMaxLTV(A, loan_discount)),
            mapQuery(apiMarket, m => m.maxLtv),
          ),
          value => formatNumber(value, 'percent.rate'),
        )}
      />
    </>
  )
}
