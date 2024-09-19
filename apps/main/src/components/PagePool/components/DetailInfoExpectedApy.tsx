import React from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { formatNumber } from '@/ui/utils'

import Box from '@/ui/Box'
import DetailInfo from '@/ui/DetailInfo'
import Icon from '@/ui/Icon'
import TooltipIcon from '@/ui/Tooltip/TooltipIcon'

type Props = {
  crvApr: number | undefined
  newCrvApr: { ratio: number; apr: number } | null
}

const DetailInfoExpectedApy: React.FC<Props> = ({ crvApr, newCrvApr }) => {
  return (
    <DetailInfo
      isBold
      loading={false}
      loadingSkeleton={[140, 23]}
      label={t`Expected CRV tAPR:`}
      tooltip={
        <TooltipIcon minWidth="200px">{t`As the number of staked LP Tokens increases, the CRV tAPR will decrease.`}</TooltipIcon>
      }
    >
      <StyledBox>
        {formatNumber(crvApr, { style: 'percent', defaultValue: '-' })}
        <Icon name="ArrowRight" size={16} className="svg-arrow" />
        {formatNumber(newCrvApr?.apr, { style: 'percent', defaultValue: '-' })}
      </StyledBox>
    </DetailInfo>
  )
}

const StyledBox = styled(Box)`
  position: relative;
  top: -1px;

  svg {
    margin: 0 0.25rem;
  }
`

export default DetailInfoExpectedApy
