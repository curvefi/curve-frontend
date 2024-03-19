import { t } from '@lingui/macro'

import { FORMAT_OPTIONS, formatNumber, NumberFormatOptions } from '@/ui/utils'
import useStore from '@/store/useStore'

import { SubTitle } from '@/components/DetailsMarket/styles'
import Box from '@/ui/Box'
import DetailInfo from '@/ui/DetailInfo'

const MarketParameters = ({ rChainId, rOwmId }: { rChainId: ChainId; rOwmId: string }) => {
  const loanPricesResp = useStore((state) => state.markets.pricesMapper[rChainId]?.[rOwmId])
  const parametersResp = useStore((state) => state.markets.statsParametersMapper[rChainId]?.[rOwmId])

  const { prices, error: pricesError } = loanPricesResp ?? {}
  const { parameters, error: parametersError } = parametersResp ?? {}

  // prettier-ignore
  const marketDetails: { label: string; value: string | number | undefined; formatOptions?: NumberFormatOptions }[][] =
    [
      [
        { label: t`Fee`, value: parameters?.fee, formatOptions: { ...FORMAT_OPTIONS.PERCENT, maximumSignificantDigits: 3 } },
        { label: t`Admin fee`, value: parameters?.admin_fee, formatOptions: { ...FORMAT_OPTIONS.PERCENT, maximumSignificantDigits: 3 } },
        { label: t`A`, value: parameters?.A, formatOptions: { useGrouping: false } },
        { label: t`Loan discount`, value: parameters?.loan_discount, formatOptions: { ...FORMAT_OPTIONS.PERCENT, maximumSignificantDigits: 2 } },
        { label: t`Liquidation discount`, value: parameters?.liquidation_discount, formatOptions: { ...FORMAT_OPTIONS.PERCENT, maximumSignificantDigits: 2 } },
      ],
      [
        { label: t`Base price`, value: prices?.basePrice, formatOptions: { showAllFractionDigits: true } },
        { label: t`Oracle price`, value: prices?.oraclePrice, formatOptions: { showAllFractionDigits: true } },
      ],
    ]

  return (
    <Box grid gridRowGap={4}>
      {marketDetails.map((details, idx) => {
        const isError = (idx === 0 && !!parametersError) || (idx === 1 && pricesError)
        return (
          <div key={`details-${idx}`}>
            {idx === 1 && <SubTitle>Prices</SubTitle>}
            {details.map(({ label, value, formatOptions }) => {
              return (
                <DetailInfo key={label} label={label}>
                  {isError ? (
                    '?'
                  ) : (
                    <strong>{formatNumber(value, { ...(formatOptions ?? {}), defaultValue: '-' })}</strong>
                  )}
                </DetailInfo>
              )
            })}
          </div>
        )
      })}
    </Box>
  )
}

export default MarketParameters
