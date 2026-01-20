import { ReactNode, useMemo } from 'react'
import { styled } from 'styled-components'
import type { HealthMode } from '@/llamalend/llamalend.types'
import { ChartLiquidationRange } from '@/llamalend/widgets/ChartLiquidationRange'
import type { LiqRangeSliderIdx } from '@/loan/store/types'
import { LoanDetails, UserLoanDetails } from '@/loan/types/loan.types'
import { Button } from '@ui/Button'
import { DetailInfo } from '@ui/DetailInfo'
import { Icon } from '@ui/Icon'
import { Chip } from '@ui/Typography'
import { formatNumberRange } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

export const DetailInfoLiqRange = ({
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
  detailInfoLeverage?: ReactNode
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
  const { userPrices: currPrices, userBands: currBands } = userLoanDetails ?? {}
  const selectedBands = selectedLiqRange?.bands

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

  const currBandsLabel = formatNumberRange(currBands)
  // todo: we should not use +selectedBands as that's an array!
  const newBandsLabel = formatNumberRange(selectedBands && +selectedBands > 0 ? selectedBands : newBands)

  return (
    <>
      <Wrapper isManage={isManage}>
        <LiqRangeEditWrapper>
          <Chip
            isBold
            tooltip={t`The range of prices where collateral is managed by the market-maker.  Collateral begins to be sold off when its price enters your liquidation range ("soft liquidation").  If the market-maker cannot keep the position sufficiently collateralized, an externally triggered "hard" liquidation may take place.`}
            tooltipProps={{
              minWidth: '250px',
              placement: 'top-start',
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
        ) : (
          isValidFormValues &&
          newBandsLabel && (
            <span>
              <strong>{newBandsLabel}</strong>
            </span>
          )
        )}
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

  &:hover:not(:disabled) {
    border-color: inherit;
    color: inherit;
    opacity: 1;
  }

  &:disabled {
    opacity: 0.5;
    cursor: initial;
  }
`
