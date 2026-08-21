import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { Tooltip, type TooltipProps } from './Tooltip'

const { IconSize, Spacing } = SizesAndSpaces

type LabelTooltipIconProps = {
  tooltip?: Omit<TooltipProps, 'children'>
}

export const LabelTooltipIcon = ({ tooltip }: LabelTooltipIconProps) =>
  tooltip && (
    <Tooltip arrow placement="top" {...tooltip} mobileDrawer>
      <InfoOutlinedIcon
        sx={{ marginLeft: Spacing.xxs, width: IconSize.xs, height: IconSize.xs, verticalAlign: 'middle' }}
      />
    </Tooltip>
  )
