import React from 'react'
import { t } from '@ui-kit/lib/i18n'
import styled from 'styled-components'

import { formatNumber } from '@ui/utils'

import Chip from '@ui/Typography/Chip'
import Icon from '@ui/Icon'

const ChipVolatileBaseApy = ({ isBold, showIcon }: { isBold?: boolean; showIcon?: boolean }) => (
  <VolatileChip
    size="md"
    isBold={isBold}
    tooltip={t`This is a volatile number that will very likely not persist.`}
    tooltipProps={{ textAlign: 'left', minWidth: '250px' }}
  >
    {formatNumber(5000)}+% {showIcon && <Icon className="svg-tooltip" size={16} name="InformationSquare" />}
  </VolatileChip>
)

const VolatileChip = styled(Chip)`
  color: var(--danger-400);
`

export default ChipVolatileBaseApy
