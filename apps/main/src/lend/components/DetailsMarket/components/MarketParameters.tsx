import React, { useEffect } from 'react'
import { t } from '@ui-kit/lib/i18n'

import { FORMAT_OPTIONS, formatNumber, NumberFormatOptions } from '@ui/utils'
import useStore from '@/lend/store/useStore'

import { SubTitle } from '@/lend/components/DetailsMarket/styles'
import Box from '@ui/Box'
import Chip from '@ui/Typography/Chip'
import DetailInfo from '@ui/DetailInfo'
import Icon from '@ui/Icon'
import { useOneWayMarket } from '@/lend/entities/chain'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { ChainId } from '@/lend/types/lend.types'

const MarketParameters = ({
  rChainId,
  rOwmId,
  type,
}: {
  rChainId: ChainId
  rOwmId: string
  type: 'borrow' | 'supply'
}) => {
  const owm = useOneWayMarket(rChainId, rOwmId).data
  const loanPricesResp = useStore((state) => state.markets.pricesMapper[rChainId]?.[rOwmId])
  const parametersResp = useStore((state) => state.markets.statsParametersMapper[rChainId]?.[rOwmId])
  const vaultPricePerShareResp = useStore((state) => state.markets.vaultPricePerShare[rChainId]?.[rOwmId])
  const fetchVaultPricePerShare = useStore((state) => state.markets.fetchVaultPricePerShare)

  const isAdvancedMode = useUserProfileStore((state) => state.isAdvancedMode)

  const { prices, error: pricesError } = loanPricesResp ?? {}
  const { parameters, error: parametersError } = parametersResp ?? {}
  const { pricePerShare, error: pricePerShareError } = vaultPricePerShareResp ?? {}

  // prettier-ignore
  const marketDetails: { label: string; value: string | number | undefined; formatOptions?: NumberFormatOptions; title?: string; isError: string; isRow?: boolean, isAdvance?: boolean; tooltip?: string }[][] = type === 'borrow' ?
    [
      [
        { label: t`AMM swap fee`, value: parameters?.fee, formatOptions: { ...FORMAT_OPTIONS.PERCENT, maximumSignificantDigits: 3 }, isError: parametersError },
        { label: t`Admin fee`, value: parameters?.admin_fee, formatOptions: { ...FORMAT_OPTIONS.PERCENT, maximumSignificantDigits: 3 }, isError: parametersError },
        { label: t`A`, value: parameters?.A, formatOptions: { useGrouping: false }, isError: parametersError },
        { label: t`Loan discount`, value: parameters?.loan_discount, formatOptions: { ...FORMAT_OPTIONS.PERCENT, maximumSignificantDigits: 2 }, isError: parametersError },
        { label: t`Liquidation discount`, value: parameters?.liquidation_discount, formatOptions: { ...FORMAT_OPTIONS.PERCENT, maximumSignificantDigits: 2 }, isError: parametersError },
        { label: t`Max LTV`, value: _getMaxLTV( parameters?.A, parameters?.loan_discount), formatOptions: { ...FORMAT_OPTIONS.PERCENT, maximumSignificantDigits: 2 }, isError: parametersError, isAdvance: true, tooltip: t`Max possible loan at N=4` },
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
    if (type === 'supply' && owm) fetchVaultPricePerShare(rChainId, owm)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, owm])

  return (
    <Box grid gridRowGap={4}>
      {marketDetails.map((details, idx) => (
        <div key={`details-${idx}`}>
          {details.map(({ label, value, formatOptions, title, isError, isRow, isAdvance, tooltip }) => {
            const show = typeof isAdvance === 'undefined' || (isAdvance && isAdvancedMode)
            return (
              <React.Fragment key={label}>
                {show ? (
                  <>
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
                          <Chip {...(tooltip ? { tooltip, tooltipProps: { noWrap: true } } : {})} isBold>
                            {formatNumber(value, { ...(formatOptions ?? {}), defaultValue: '-' })}
                            {tooltip && <Icon className="svg-tooltip" name="InformationSquare" size={16} />}
                          </Chip>
                        )}
                      </DetailInfo>
                    )}
                  </>
                ) : null}
              </React.Fragment>
            )
          })}
        </div>
      ))}
    </Box>
  )
}

// In [1]: ltv = lambda x: ((x[0] - 1) / x[0])**2 * (1 - x[1])
// In [2]: ltv((30, 0.11))
// Out[2]: 0.8316555555555556
// where x[0] is A, x[1] is loan discount normalised between 0 and 1 (so 11% is 0.11). multiply ltv by 100 to show percentage.
// always show 'max ltv' which is the max possible loan at N=4 (not advisable but hey it exists!).
function _getMaxLTV(a: string | undefined, loanDiscount: string | undefined) {
  if (typeof a === 'undefined' || typeof loanDiscount === 'undefined') return ''
  return ((+a - 1) / +a) ** 2 * (1 - +loanDiscount / 100) * 100
}

export default MarketParameters
