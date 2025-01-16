import type { LiqRangeSliderIdx } from '@/loan/store/types'

import { t } from '@lingui/macro'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import { formatNumber } from '@ui/utils'

import { Chip } from '@ui/Typography'
import Button from '@ui/Button'
import DetailInfo from '@ui/DetailInfo'
import ChartLiquidationRange from '@/loan/components/ChartLiquidationRange'
import Icon from '@ui/Icon'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

const DetailInfoLiqRange = ({
  bands: newBands,
  detailInfoLeverage,
  healthMode,
  isEditLiqRange = false,
  isManage = false,
  isValidFormValues = true,
  loading,
  loanDetails,
  prices: newPrices,
  selectedLiqRange,
  userLoanDetails,
  handleLiqRangesEdit,
}: {
  bands: [number, number]
  detailInfoLeverage?: React.ReactNode
  healthMode: HealthMode | null
  isEditLiqRange?: boolean
  isManage?: boolean
  isValidFormValues?: boolean
  loanDetails: Partial<LoanDetails> | undefined
  loading: boolean
  prices: string[]
  selectedLiqRange?: LiqRangeSliderIdx
  userLoanDetails: UserLoanDetails | undefined
  handleLiqRangesEdit?: () => void
}) => {
  const theme = useUserProfileStore((state) => state.theme)

  const { userPrices: currPrices, userBands: currBands } = userLoanDetails ?? {}

  // default to empty data to show chart
  const liqRangeData = useMemo(() => {
    const parsedNewPrices = [
      +(selectedLiqRange?.prices?.[0] ?? newPrices?.[0] ?? '0'),
      +(selectedLiqRange?.prices?.[1] ?? newPrices?.[1] ?? '0'),
    ]

    return [
      {
        name: '',
        currLabel: 'LR',
        curr: [+(currPrices?.[1] ?? '0'), +(currPrices?.[0] ?? '0')],
        newLabel: currPrices ? 'LR (new)' : 'LR',
        new: [parsedNewPrices[0], parsedNewPrices[1]],
        oraclePrice: loanDetails?.priceInfo?.oraclePrice ?? '',
        oraclePriceBand: loanDetails?.priceInfo?.oraclePriceBand ?? 0,
      },
    ]
  }, [currPrices, newPrices, selectedLiqRange?.prices, loanDetails?.priceInfo])

  const currBandsLabel = useMemo(() => {
    const [currBand0, currBand1] = currBands ?? []
    return typeof currBand0 !== 'undefined' && typeof currBand1 !== 'undefined' && !(currBand0 === 0 && currBand1 === 0)
      ? `${formatNumber(currBand0)} - ${formatNumber(currBand1)}`
      : ''
  }, [currBands])

  const newBandsLabel = useMemo(() => {
    let newBand0
    let newBand1

    if (selectedLiqRange?.bands && +selectedLiqRange.bands > 0) {
      ;[newBand0, newBand1] = selectedLiqRange.bands
    } else if (newBands) {
      ;[newBand0, newBand1] = newBands
    }

    return typeof newBand0 !== 'undefined' && typeof newBand1 !== 'undefined' && !(newBand0 === 0 && newBand1 === 0)
      ? `${formatNumber(newBand0)} - ${formatNumber(newBand1)}`
      : ''
  }, [selectedLiqRange?.bands, newBands])

  return (
    <>
      <Wrapper isManage={isManage}>
        <LiqRangeEditWrapper>
          <Chip
            isBold
            tooltip={t`The range of prices where collateral is managed by the market-maker.  Collateral begins to be sold off when its price enters your liquidation range ("soft liquidation").  If the market-maker cannot keep the position sufficiently collateralized, an externally triggered "hard" liquidation may take place.`}
            tooltipProps={{
              minWidth: '250px',
              placement: 'top start',
            }}
          >
            {t`Liquidation range:`} <Icon name="InformationSquare" size={16} className="svg-tooltip" />
          </Chip>
          {!isManage && (
            <LiqRangeEditButton variant="outlined" onClick={handleLiqRangesEdit}>
              {isEditLiqRange ? 'Hide' : 'Adjust'}
            </LiqRangeEditButton>
          )}
        </LiqRangeEditWrapper>

        {/* Liquidation range chart */}
        <ChartLiquidationRange
          data={
            isValidFormValues
              ? liqRangeData
              : [
                  {
                    name: '',
                    currLabel: 'LR',
                    curr: [0, 0],
                    newLabel: 'LR',
                    new: [0, 0],
                    oraclePrice: '',
                    oraclePriceBand: 0,
                  },
                ]
          }
          healthColorKey={healthMode?.colorKey}
          isManage={isManage}
          theme={theme === 'light' ? 'default' : theme}
        />
      </Wrapper>

      {/* Detail info leverage */}
      {detailInfoLeverage && detailInfoLeverage}

      {/* Detail info band range */}
      <DetailInfo loading={loading} loadingSkeleton={[200, 23]} label={t`Band range:`}>
        {isValidFormValues && currBandsLabel && newBandsLabel ? (
          <span>
            {currBandsLabel} <Icon name="ArrowRight" size={16} className="svg-arrow" /> <strong>{newBandsLabel}</strong>
          </span>
        ) : isValidFormValues && newBandsLabel ? (
          <span>
            <strong>{newBandsLabel}</strong>
          </span>
        ) : null}
      </DetailInfo>
    </>
  )
}

const Wrapper = styled.div<{ isManage: boolean }>`
  margin: ${({ isManage }) => (isManage ? '0 0 1rem 0' : '1rem 0')};
  min-height: 1.5rem; // 24px
`

const LiqRangeEditWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`

const LiqRangeEditButton = styled(Button)`
  background-color: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.7;
  padding: 0.25rem 0.5rem;
  font-size: var(--font-size-2);
  text-align: right;

  :hover:not(:disabled) {
    border-color: inherit;
    color: inherit;
    opacity: 1;
  }

  :disabled {
    opacity: 0.5;
    cursor: initial;
  }
`

export default DetailInfoLiqRange
