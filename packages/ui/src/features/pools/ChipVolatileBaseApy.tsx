import { formatNumber } from '@primitives/number.utils'
import { Badge } from '@ui/components/Badge'
import { Tooltip } from '@ui/components/Tooltip'
import { WithWrapper } from '@ui/components/WithWrapper'
import { InfoCircledIcon } from '@ui/icons/InfoCircledIcon'
import { t } from '@ui/lib/i18n'
import { MAX_DISPLAY_RATE_PERCENT } from '@ui/lib/rates.utils'

export const ChipVolatileBaseApy = ({
  isBold,
  showIcon,
  disableTooltip = false,
}: {
  isBold?: boolean
  showIcon?: boolean
  disableTooltip?: boolean
}) => (
  <WithWrapper
    shouldWrap={!disableTooltip}
    Wrapper={Tooltip}
    title={t`This is a volatile number that will very likely not persist.`}
  >
    <Badge
      size="small"
      color="alert"
      label={`${formatNumber(MAX_DISPLAY_RATE_PERCENT, { abbreviate: false })}+%`}
      {...(showIcon && { icon: <InfoCircledIcon /> })}
      {...(isBold && { sx: { fontWeight: 'bold' } })}
    />
  </WithWrapper>
)
