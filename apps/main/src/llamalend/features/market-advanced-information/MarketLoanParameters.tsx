import { useMarketParameters } from '@/llamalend/queries/market'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { actionInfoQuery } from '@/llamalend/widgets/action-card/info-actions.helpers'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { fallbackQ, mapQuery, type QueryProp } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'

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
            {...actionInfoQuery(
              mapQuery(parameters, d => d.fee),
              'percent.rate',
            )}
          />

          <ActionInfo
            testId="market-param-admin-fee"
            label={t`Admin fee`}
            {...actionInfoQuery(
              mapQuery(parameters, d => d.admin_fee),
              'percent.rate',
            )}
          />
        </>
      )}

      <ActionInfo
        testId="market-param-band-width-factor"
        label={t`Band width factor`}
        {...actionInfoQuery(
          fallbackQ(
            mapQuery(parameters, p => p.A),
            mapQuery(apiMarket, m => m.parameters.A),
          ),
          { abbreviate: false, useGrouping: false },
        )}
      />

      <ActionInfo
        testId="market-param-loan-discount"
        label={t`Loan discount`}
        {...actionInfoQuery(
          fallbackQ(
            mapQuery(parameters, p => p.loan_discount),
            mapQuery(apiMarket, m => decimal(m.parameters.loanDiscount)),
          ),
          'percent.rate',
        )}
      />

      <ActionInfo
        testId="market-param-liquidation-discount"
        label={t`Liquidation discount`}
        {...actionInfoQuery(
          fallbackQ(
            mapQuery(parameters, p => p.liquidation_discount),
            mapQuery(apiMarket, m => decimal(m.parameters.liquidationDiscount)),
          ),
          'percent.rate',
        )}
      />

      <ActionInfo
        testId="market-param-max-ltv"
        label={t`Max LTV`}
        valueTooltip={t`Max possible loan at N=4`}
        {...actionInfoQuery(
          fallbackQ(
            mapQuery(parameters, ({ A, loan_discount }) => getMaxLTV(A, loan_discount)),
            mapQuery(apiMarket, m => m.maxLtv),
          ),
          'percent.rate',
        )}
      />
    </>
  )
}
