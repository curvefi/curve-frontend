import { useMarketParameters } from '@/llamalend/queries/market-parameters'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { FORMAT_OPTIONS, formatNumber, NumberFormatOptions } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'

// In [1]: ltv = lambda x: ((x[0] - 1) / x[0])**2 * (1 - x[1])
// In [2]: ltv((30, 0.11))
// Out[2]: 0.8316555555555556
// where x[0] is A, x[1] is loan discount normalised between 0 and 1 (so 11% is 0.11). multiply ltv by 100 to show percentage.
// always show 'max ltv' which is the max possible loan at N=4 (not advisable but hey it exists!).
function getMaxLTV(a: string | undefined, loanDiscount: string | undefined) {
  if (typeof a === 'undefined' || typeof loanDiscount === 'undefined') return
  return ((+a - 1) / +a) ** 2 * (1 - +loanDiscount / 100) * 100
}

type MarketDetails = {
  label: string
  value: string | number | undefined
  formatOptions: NumberFormatOptions
  tooltip?: string
}

export const MarketLoanParameters = ({ chainId, marketId }: { chainId: IChainId; marketId: string }) => {
  const {
    data: parameters,
    isLoading: isLoadingParameters,
    error: errorParameters,
  } = useMarketParameters({ chainId, marketId })

  const details: MarketDetails[] = [
    {
      label: t`AMM swap fee`,
      value: parameters?.fee,
      formatOptions: { ...FORMAT_OPTIONS.PERCENT, maximumSignificantDigits: 3 },
    },
    {
      label: t`Admin fee`,
      value: parameters?.admin_fee,
      formatOptions: { ...FORMAT_OPTIONS.PERCENT, maximumSignificantDigits: 3 },
    },
    {
      label: t`Band width factor`,
      value: parameters?.A,
      formatOptions: { useGrouping: false },
    },
    {
      label: t`Loan discount`,
      value: parameters?.loan_discount,
      formatOptions: { ...FORMAT_OPTIONS.PERCENT, maximumSignificantDigits: 2 },
    },
    {
      label: t`Liquidation discount`,
      value: parameters?.liquidation_discount,
      formatOptions: { ...FORMAT_OPTIONS.PERCENT, maximumSignificantDigits: 2 },
    },
    {
      label: t`Max LTV`,
      value: getMaxLTV(parameters?.A, parameters?.loan_discount),
      formatOptions: { ...FORMAT_OPTIONS.PERCENT, maximumSignificantDigits: 2 },
      tooltip: t`Max possible loan at N=4`,
    },
  ]

  return (
    <>
      {details.map(({ label, value, formatOptions, tooltip }) => (
        <ActionInfo
          key={label}
          label={label}
          value={formatNumber(value, formatOptions)}
          valueTooltip={tooltip}
          loading={isLoadingParameters}
          error={errorParameters}
        />
      ))}
    </>
  )
}
