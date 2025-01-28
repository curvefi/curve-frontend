import type { ChipProps } from '@ui/Typography/types'

import React, { useState } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { buttonOutlinedStyles } from '@ui/Button/styles'
import useStore from '@/lend/store/useStore'
import useSupplyTotalApr from '@/lend/hooks/useSupplyTotalApr'

import Button from '@ui/Button'
import Chip from '@ui/Typography/Chip'
import ChipInactive from '@/lend/components/ChipInactive'
import CellRewardsTooltip from '@/lend/components/SharedCellData/CellRewardsTooltip'
import Icon from '@ui/Icon'
import { ChainId } from '@/lend/types/lend.types'

const CellRewards = ({
  className = '',
  rChainId,
  rOwmId,
  ...props
}: ChipProps & {
  className?: string
  rChainId: ChainId
  rOwmId: string
}) => {
  const { isReady, isError, invalidGaugeAddress, totalApr, tooltipValues } = useSupplyTotalApr(rChainId, rOwmId)
  const isMdUp = useStore((state) => state.layout.isMdUp)

  const [showDetails, setShowDetails] = useState(false)

  return (
    <span>
      {!isReady ? null : isError ? (
        '?'
      ) : invalidGaugeAddress ? (
        <ChipInactive>No gauge</ChipInactive>
      ) : (
        <Wrapper {...props}>
          {totalApr.minMax}{' '}
          {!isMdUp && tooltipValues ? (
            <>
              <DetailsBtn onClick={() => setShowDetails(!showDetails)}>{t`Details`}</DetailsBtn>{' '}
              {showDetails && (
                <CellRewardsTooltip className={className} isMobile totalApr={totalApr} tooltipValues={tooltipValues} />
              )}
            </>
          ) : (
            <StyledChip
              {...props}
              {...(isMdUp && tooltipValues
                ? {
                    tooltipProps: {
                      minWidth: '300px',
                      placement: 'top',
                    },
                    tooltip: (
                      <CellRewardsTooltip className={className} totalApr={totalApr} tooltipValues={tooltipValues} />
                    ),
                  }
                : {})}
            >
              <Icon className="svg-tooltip" size={16} name="InformationSquare" />
            </StyledChip>
          )}
        </Wrapper>
      )}
    </span>
  )
}

const StyledChip = styled(Chip)`
  cursor: default;
`

const DetailsBtn = styled(Button)`
  ${buttonOutlinedStyles};

  display: inline-flex;
  align-items: center;
  font-family: inherit;
  font-weight: bold;
  font-size: var(--font-size-2);
`

const Wrapper = styled(Chip)`
  white-space: nowrap;
`

export default CellRewards
