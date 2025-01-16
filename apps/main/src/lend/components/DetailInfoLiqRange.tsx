import type { LiqRangeSliderIdx } from '@/lend/store/types'

import React, { useMemo } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { formatNumber } from '@/ui/utils'
import useStore from '@/lend/store/useStore'

import { Chip } from '@/ui/Typography'
import Button from '@/ui/Button'
import ChartLiquidationRange from '@/lend/components/ChartLiquidationRange'
import DetailInfo from '@/ui/DetailInfo'
import Icon from '@/ui/Icon'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

const DetailInfoLiqRange = ({
  rChainId,
  rOwmId,
  bands: newBands,
  detailInfoLeverage,
  healthMode,
  isEditLiqRange = false,
  isFullRepay,
  isManage = false,
  isValidFormValues = true,
  loading,
  prices: newPrices,
  selectedLiqRange,
  userActiveKey,
  handleLiqRangesEdit,
}: {
  rChainId: ChainId
  rOwmId: string
  detailInfoLeverage?: React.ReactNode
  bands: [number, number]
  healthMode: HealthMode | null
  isEditLiqRange?: boolean
  isFullRepay?: boolean
  isManage?: boolean
  isValidFormValues?: boolean
  loading: boolean
  prices: string[]
  selectedLiqRange?: LiqRangeSliderIdx
  userActiveKey: string
  handleLiqRangesEdit?: () => void
}) => {
  const userDetailsResp = useStore((state) => state.user.loansDetailsMapper[userActiveKey])
  const loanPricesResp = useStore((state) => state.markets.pricesMapper[rChainId]?.[rOwmId])

  const theme = useUserProfileStore((state) => state.theme)

  const { prices: loanPrices } = loanPricesResp ?? {}
  const { prices: currPrices, bands: currBands } = userDetailsResp?.details ?? {}

  const { parsedNewBands, parsedNewPrices } = useMemo(
    () =>
      isFullRepay
        ? { parsedNewBands: [0, 0], parsedNewPrices: [0, 0] }
        : {
            parsedNewBands: newBands,
            parsedNewPrices: [
              +(selectedLiqRange?.prices?.[0] ?? newPrices?.[0] ?? '0'),
              +(selectedLiqRange?.prices?.[1] ?? newPrices?.[1] ?? '0'),
            ],
          },
    [isFullRepay, newBands, newPrices, selectedLiqRange?.prices],
  )

  // default to empty data to show chart
  const liqRangeData = useMemo(
    () => [
      {
        name: '',
        currLabel: 'LR',
        curr: [+(currPrices?.[1] ?? '0'), +(currPrices?.[0] ?? '0')],
        newLabel: currPrices ? 'LR (new)' : 'LR',
        new: [parsedNewPrices[0], parsedNewPrices[1]],
        oraclePrice: loanPrices?.oraclePrice ?? '',
        oraclePriceBand: loanPrices?.oraclePriceBand ?? 0,
      },
    ],
    [currPrices, parsedNewPrices, loanPrices?.oraclePrice, loanPrices?.oraclePriceBand],
  )

  const currBandsLabel = useMemo(() => {
    const [currBand0, currBand1] = currBands ?? []
    return typeof currBand0 !== 'undefined' && typeof currBand1 !== 'undefined' && !(currBand0 === 0 && currBand1 === 0)
      ? `${formatNumber(currBand0)} to ${formatNumber(currBand1)}`
      : ''
  }, [currBands])

  const newBandsLabel = useMemo(() => {
    let newBand0
    let newBand1

    if (selectedLiqRange?.bands && +selectedLiqRange.bands > 0) {
      ;[newBand0, newBand1] = selectedLiqRange.bands
    } else if (parsedNewBands) {
      ;[newBand0, newBand1] = parsedNewBands
    }

    return typeof newBand0 !== 'undefined' && typeof newBand1 !== 'undefined' && !(newBand0 === 0 && newBand1 === 0)
      ? `${formatNumber(newBand0)} to ${formatNumber(newBand1)}`
      : ''
  }, [selectedLiqRange?.bands, parsedNewBands])

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
          data={liqRangeData}
          healthColorKey={healthMode?.colorKey}
          isManage={isManage}
          theme={theme}
        />
      </Wrapper>

      {/* Detail info leverage */}
      {detailInfoLeverage && detailInfoLeverage}

      {!isFullRepay && (
        <>
          {/* Detail info band range */}
          <DetailInfo loading={loading} loadingSkeleton={[200, 23]} label={t`Band range:`}>
            {isValidFormValues && currBandsLabel && newBandsLabel ? (
              <span>
                {currBandsLabel} <Icon name="ArrowRight" size={16} className="svg-arrow" />{' '}
                <strong>{newBandsLabel}</strong>
              </span>
            ) : isValidFormValues && newBandsLabel ? (
              <span>
                <strong>{newBandsLabel}</strong>
              </span>
            ) : null}
          </DetailInfo>

          {/* Detail info price range */}
          <DetailInfo loading={loading} loadingSkeleton={[200, 23]} label={t`Price range:`}>
            {newPrices?.[0] && newPrices?.[1] ? (
              <strong>
                {formatNumber(newPrices[0], { maximumSignificantDigits: 5 })} to{' '}
                {formatNumber(newPrices[1], { maximumSignificantDigits: 5 })}
              </strong>
            ) : null}
          </DetailInfo>
        </>
      )}
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
