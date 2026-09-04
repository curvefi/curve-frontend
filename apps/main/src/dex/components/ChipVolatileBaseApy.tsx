import { styled } from 'styled-components'
import { formatNumber } from '@evm-ui/utils'
import { Icon } from '@legacy-ui/Icon'
import { Chip } from '@legacy-ui/Typography/Chip'
import { t } from '@ui/lib/i18n'

export const ChipVolatileBaseApy = ({
  isBold,
  showIcon,
  disableTooltip = false,
}: {
  isBold?: boolean
  showIcon?: boolean
  disableTooltip?: boolean
}) => (
  <VolatileChip
    size="md"
    isBold={isBold}
    tooltip={disableTooltip ? undefined : t`This is a volatile number that will very likely not persist.`}
    tooltipProps={{ textAlign: 'left', minWidth: '250px' }}
  >
    {formatNumber(5000, { abbreviate: false })}
    +% {showIcon && <Icon className="svg-tooltip" size={16} name="InformationSquare" />}
  </VolatileChip>
)

const VolatileChip = styled(Chip)`
  color: var(--danger-400);
`
