import useStore from '@/loan/store/useStore'
import type { MintMarketTemplate } from '@curvefi/llamalend-api/lib/mintMarkets'
import Stack from '@mui/material/Stack'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'

export const LoanInfoParameters = ({
  market,
  marketId: marketId,
}: {
  market: MintMarketTemplate | null
  marketId: string
}) => {
  const loanDetails = useStore((state) => state.loans.detailsMapper[marketId])
  const { parameters, priceInfo } = loanDetails ?? {}

  return (
    <Stack>
      <ActionInfo
        label={t`Band width factor`}
        value={formatNumber(market?.A, { useGrouping: false })}
        loading={market?.A == null}
      />

      <ActionInfo
        label={t`Base price`}
        value={formatNumber(loanDetails?.basePrice)}
        valueTooltip={formatNumber(loanDetails?.basePrice, { decimals: 5 })}
        loading={loanDetails?.basePrice == null}
      />

      <ActionInfo
        label={t`Oracle price`}
        value={formatNumber(priceInfo?.oraclePrice)}
        valueTooltip={formatNumber(priceInfo?.oraclePrice, { decimals: 5 })}
        loading={priceInfo?.oraclePrice == null}
      />

      <ActionInfo
        label={t`Borrow rate`}
        value={formatNumber(parameters?.rate, { style: 'percent' })}
        valueTooltip={formatNumber(parameters?.rate, { style: 'percent', decimals: 5 })}
        loading={parameters?.rate == null}
      />
    </Stack>
  )
}
