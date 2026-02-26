import { useMarketParameters } from '@/llamalend/queries/market-parameters.query'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { formatNumber, formatPercent } from '@ui-kit/utils'

// In [1]: ltv = lambda x: ((x[0] - 1) / x[0])**2 * (1 - x[1])
// In [2]: ltv((30, 0.11))
// Out[2]: 0.8316555555555556
// where x[0] is A, x[1] is loan discount normalised between 0 and 1 (so 11% is 0.11). multiply ltv by 100 to show percentage.
// always show 'max ltv' which is the max possible loan at N=4 (not advisable but hey it exists!).
function getMaxLTV(a: number | undefined, loanDiscount: string | undefined) {
  if (a == null || loanDiscount == null) return
  return ((+a - 1) / +a) ** 2 * (1 - +loanDiscount / 100) * 100
}

export const MarketLoanParameters = ({ chainId, marketId }: { chainId: IChainId; marketId: string | undefined }) => {
  const {
    data: parameters,
    isLoading: isLoadingParameters,
    error: errorParameters,
  } = useMarketParameters({ chainId, marketId })

  return (
    <>
      <ActionInfo
        label={t`AMM swap fee`}
        value={formatPercent(parameters?.fee)}
        loading={isLoadingParameters}
        error={errorParameters}
      />

      <ActionInfo
        label={t`Admin fee`}
        value={formatPercent(parameters?.admin_fee)}
        loading={isLoadingParameters}
        error={errorParameters}
      />

      <ActionInfo
        label={t`Band width factor`}
        value={formatNumber(parameters?.A ?? 0, { abbreviate: false, useGrouping: false })}
        loading={isLoadingParameters}
        error={errorParameters}
      />

      <ActionInfo
        label={t`Loan discount`}
        value={formatPercent(parameters?.loan_discount)}
        loading={isLoadingParameters}
        error={errorParameters}
      />

      <ActionInfo
        label={t`Liquidation discount`}
        value={formatPercent(parameters?.liquidation_discount)}
        loading={isLoadingParameters}
        error={errorParameters}
      />

      <ActionInfo
        label={t`Max LTV`}
        value={formatPercent(getMaxLTV(parameters?.A ?? 0, parameters?.loan_discount))}
        valueTooltip={t`Max possible loan at N=4`}
        loading={isLoadingParameters}
        error={errorParameters}
      />
    </>
  )
}
