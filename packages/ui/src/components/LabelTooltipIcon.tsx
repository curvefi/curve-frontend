import { Tooltip, type TooltipProps } from '@ui/components/Tooltip'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { InfoCircledIcon } from '@ui/icons/InfoCircledIcon'

const { IconSize, Spacing } = SizesAndSpaces

type LabelTooltipIconProps = { tooltip?: Omit<TooltipProps, 'children'> }

export const LabelTooltipIcon = ({ tooltip }: LabelTooltipIconProps) =>
  tooltip && (
    <Tooltip arrow placement="top" {...tooltip} mobileDrawer>
      <InfoCircledIcon
        sx={{ marginLeft: Spacing.xxs, width: IconSize.xs, height: IconSize.xs, verticalAlign: 'middle' }}
      />
    </Tooltip>
  )
