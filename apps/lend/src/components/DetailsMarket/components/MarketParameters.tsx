import React, { useEffect } from 'react'
import { t } from '@lingui/macro'

import { FORMAT_OPTIONS, formatNumber, NumberFormatOptions } from '@/ui/utils'
import useStore from '@/store/useStore'

import { SubTitle } from '@/components/DetailsMarket/styles'
import Box from '@/ui/Box'
import Chip from '@/ui/Typography/Chip'
import DetailInfo from '@/ui/DetailInfo'

const MarketParameters = ({
  rChainId,
  rOwmId,
  type,
}: {
  rChainId: ChainId
  rOwmId: string
  type: 'borrow' | 'supply'
}) => {
  const owmData = useStore((state) => state.markets.owmDatasMapper[rChainId]?.[rOwmId])
  const loanPricesResp = useStore((state) => state.markets.pricesMapper[rChainId]?.[rOwmId])
  const parametersResp = useStore((state) => state.markets.statsParametersMapper[rChainId]?.[rOwmId])
  const vaultPricePerShareResp = useStore((state) => state.markets.vaultPricePerShare[rChainId]?.[rOwmId])
  const fetchVaultPricePerShare = useStore((state) => state.markets.fetchVaultPricePerShare)

  const { prices, error: pricesError } = loanPricesResp ?? {}
  const { parameters, error: parametersError } = parametersResp ?? {}
  const { pricePerShare, error: pricePerShareError } = vaultPricePerShareResp ?? {}

  // prettier-ignore
  const marketDetails: { label: string; value: string | number | undefined; formatOptions?: NumberFormatOptions; title?: string; isError: string; isRow?: boolean }[][] = type === 'borrow' ?
    [
      [
        { label: t`Fee`, value: parameters?.fee, formatOptions: { ...FORMAT_OPTIONS.PERCENT, maximumSignificantDigits: 3 }, isError: parametersError },
        { label: t`Admin fee`, value: parameters?.admin_fee, formatOptions: { ...FORMAT_OPTIONS.PERCENT, maximumSignificantDigits: 3 }, isError: parametersError },
        { label: t`A`, value: parameters?.A, formatOptions: { useGrouping: false }, isError: parametersError },
        { label: t`Loan discount`, value: parameters?.loan_discount, formatOptions: { ...FORMAT_OPTIONS.PERCENT, maximumSignificantDigits: 2 }, isError: parametersError },
        { label: t`Liquidation discount`, value: parameters?.liquidation_discount, formatOptions: { ...FORMAT_OPTIONS.PERCENT, maximumSignificantDigits: 2 }, isError: parametersError },
      ],
      [
        { label: t`Base price`, value: prices?.basePrice, formatOptions: { showAllFractionDigits: true }, title: t`Prices`, isError: pricesError },
        { label: t`Oracle price`, value: prices?.oraclePrice, formatOptions: { showAllFractionDigits: true }, isError: pricesError },
      ],
    ] : [
      [
        { label: t`Price per share`, value: pricePerShare, formatOptions: { showAllFractionDigits: true }, isRow: true, isError: pricePerShareError },
      ]
    ]

  useEffect(() => {
    if (type === 'supply' && owmData) fetchVaultPricePerShare(rChainId, owmData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, owmData])

  return (
    <Box grid gridRowGap={4}>
      {marketDetails.map((details, idx) => {
        const isError = (idx === 0 && !!parametersError) || (idx === 1 && pricesError)
        return (
          <div key={`details-${idx}`}>
            {details.map(({ label, value, formatOptions, title, isError, isRow }) => {
              return (
                <React.Fragment key={label}>
                  {title && <SubTitle>{title}</SubTitle>}
                  {isRow ? (
                    <Box grid>
                      <Chip isBold>{label}:</Chip>
                      <strong>{formatNumber(value, { ...(formatOptions ?? {}), defaultValue: '-' })}</strong>
                    </Box>
                  ) : (
                    <DetailInfo key={label} label={label}>
                      {isError ? (
                        '?'
                      ) : (
                        <strong>{formatNumber(value, { ...(formatOptions ?? {}), defaultValue: '-' })}</strong>
                      )}
                    </DetailInfo>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        )
      })}
    </Box>
  )
}

export default MarketParameters
