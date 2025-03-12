import { Fragment } from 'react'
import styled from 'styled-components'
import TextCaption from '@ui/TextCaption'
import { t } from '@ui-kit/lib/i18n'

const CellRewardsTooltip = ({
  className = '',
  isMobile,
  noPadding,
  totalApr,
  tooltipValues,
}: {
  className?: string
  isMobile?: boolean
  noPadding?: boolean
  totalApr: { min: string; max: string; minMax: string }
  tooltipValues: { lendApr: string; lendApy: string; crv: string; crvBoosted: string; incentives: string[] }
}) => (
  <TooltipWrapper className={className} isMobile={isMobile || noPadding}>
    {!isMobile ? (
      <TooltipTitle>
        <TextCaption isBold isCaps>
          Total APR
        </TextCaption>
        {totalApr.minMax}
      </TooltipTitle>
    ) : null}

    {/* LEND */}
    <TooltipItem>
      <span>{t`Lend APR`}</span>{' '}
      <span>
        {tooltipValues.lendApr} <TextCaption>({tooltipValues.lendApy})</TextCaption>
      </span>
    </TooltipItem>

    {/* CRV */}
    {tooltipValues.crv && (
      <TooltipItem>
        <span>
          CRV APR <TextCaption>(unboosted)</TextCaption>
        </span>{' '}
        <span>{tooltipValues.crv}</span>
      </TooltipItem>
    )}
    {tooltipValues.crvBoosted && (
      <TooltipItem>
        <span>CRV APR {tooltipValues.crvBoosted && <TextCaption>(max boosted)</TextCaption>}</span>{' '}
        <span>{tooltipValues.crvBoosted}</span>
      </TooltipItem>
    )}

    {/* INCENTIVES */}
    {tooltipValues.incentives.length > 0 && (
      <TooltipItem>
        <span>{t`Incentives APR`}</span>{' '}
        <span>
          {tooltipValues.incentives.map((incentive) => (
            <Fragment key={incentive}>
              {incentive}
              <br />
            </Fragment>
          ))}
        </span>
      </TooltipItem>
    )}
  </TooltipWrapper>
)

const TooltipWrapper = styled.div<{ isMobile?: boolean }>`
  text-align: left;

  ${({ isMobile }) => {
    if (!isMobile) {
      return `
        font-weight: bold;
        padding-left: var(--spacing-2);
        padding-right: var(--spacing-2);
      `
    } else {
      return `padding-top: var(--spacing-1);`
    }
  }}
`

const TooltipTitle = styled.h3`
  display: flex;
  flex-direction: column;
  margin-bottom: var(--spacing-normal);
  font-size: var(--font-size-4);
`

const TooltipItem = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-2);
  margin-bottom: var(--spacing-1);

  > span:first-of-type {
    white-space: nowrap;
    padding-right: var(--spacing-2);
  }
  > span:last-of-type {
    text-align: right;
  }
`

export default CellRewardsTooltip
