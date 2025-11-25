import { useEffect } from 'react'
import useStore from '@/lend/store/useStore'
import { ChainId } from '@/lend/types/lend.types'
import type { LendMarketTemplate } from '@curvefi/llamalend-api/lib/lendMarkets'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FORMAT_OPTIONS, formatNumber, NumberFormatOptions } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import ActionInfo from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

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
  title: string
  details: {
    label: string
    value: string | number | undefined
    formatOptions?: NumberFormatOptions
    isError: string
    tooltip?: string
  }[]
}

export const MarketParameters = ({
  chainId,
  market,
  marketId,
  type,
}: {
  chainId: ChainId
  market: LendMarketTemplate | undefined
  marketId: string
  type: 'borrow' | 'supply'
}) => {
  const loanPricesResp = useStore((state) => state.markets.pricesMapper[chainId]?.[marketId])
  const parametersResp = useStore((state) => state.markets.statsParametersMapper[chainId]?.[marketId])
  const vaultPricePerShareResp = useStore((state) => state.markets.vaultPricePerShare[chainId]?.[marketId])
  const fetchVaultPricePerShare = useStore((state) => state.markets.fetchVaultPricePerShare)

  const { prices, error: pricesError } = loanPricesResp ?? {}
  const { parameters, error: parametersError } = parametersResp ?? {}
  const { pricePerShare, error: pricePerShareError } = vaultPricePerShareResp ?? {}

  // prettier-ignore
  const marketDetails: MarketDetails[] = type === 'borrow' ?
    [
      { title: t`Loan Parameters`, details: [
        { label: t`AMM swap fee`, value: parameters?.fee, formatOptions: { ...FORMAT_OPTIONS.PERCENT, maximumSignificantDigits: 3 }, isError: parametersError },
        { label: t`Admin fee`, value: parameters?.admin_fee, formatOptions: { ...FORMAT_OPTIONS.PERCENT, maximumSignificantDigits: 3 }, isError: parametersError },
        { label: t`Band width factor`, value: parameters?.A, formatOptions: { useGrouping: false }, isError: parametersError },
        { label: t`Loan discount`, value: parameters?.loan_discount, formatOptions: { ...FORMAT_OPTIONS.PERCENT, maximumSignificantDigits: 2 }, isError: parametersError },
        { label: t`Liquidation discount`, value: parameters?.liquidation_discount, formatOptions: { ...FORMAT_OPTIONS.PERCENT, maximumSignificantDigits: 2 }, isError: parametersError },
        { label: t`Max LTV`, value: getMaxLTV( parameters?.A, parameters?.loan_discount), formatOptions: { ...FORMAT_OPTIONS.PERCENT, maximumSignificantDigits: 2 }, isError: parametersError, tooltip: t`Max possible loan at N=4` },
      ]},
      { title: t`Prices`, details: [
        { label: t`Base price`, value: prices?.basePrice, formatOptions: { decimals: 5 }, isError: pricesError },
        { label: t`Oracle price`, value: prices?.oraclePrice, formatOptions: { decimals: 5 }, isError: pricesError },
      ]},
    ] : [
      {title: t`Prices`, details: [
        { label: t`Price per share`, value: pricePerShare, formatOptions: { decimals: 5 }, isError: pricePerShareError },
      ]}
    ]

  useEffect(() => {
    if (type === 'supply' && market) void fetchVaultPricePerShare(chainId, market)
  }, [type, market, fetchVaultPricePerShare, chainId])

  return (
    <Stack gap={Spacing.md}>
      {marketDetails.map(({ title, details }) => (
        <Stack gap={Spacing.xs} key={title}>
          <Typography variant="headingXsBold">{title}</Typography>

          {details.map(({ label, value, formatOptions, isError, tooltip }) => (
            <Stack gap={Spacing.xs} key={label}>
              <ActionInfo
                label={label}
                value={isError ? '?' : formatNumber(value, { ...(formatOptions ?? {}), defaultValue: '-' })}
                valueTooltip={tooltip}
                loading={value == null}
              />
            </Stack>
          ))}
        </Stack>
      ))}
    </Stack>
  )
}
