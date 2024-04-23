import type { ChipProps } from '@/ui/Typography/types'

import React, { useState } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { buttonOutlinedStyles } from '@/ui/Button/styles'
import useStore from '@/store/useStore'
import useSupplyTotalApr from '@/hooks/useSupplyTotalApr'

import Button from '@/ui/Button'
import Chip from '@/ui/Typography/Chip'
import ChipInactive from '@/components/ChipInactive'
import CellRewardsTooltip from '@/components/SharedCellData/CellRewardsTooltip'
import Icon from '@/ui/Icon'

const CellRewards = ({
  className = '',
  rChainId,
  rOwmId,
  type,
  ...props
}: ChipProps & {
  className?: string
  rChainId: ChainId
  rOwmId: string
  type: 'crv-other'
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
      ) : type === 'crv-other' ? (
        <Chip {...props}>
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
        </Chip>
      ) : null}
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

export default CellRewards
