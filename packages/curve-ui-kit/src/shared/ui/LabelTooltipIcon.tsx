import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Tooltip, type TooltipProps } from './Tooltip'

const { IconSize, Spacing } = SizesAndSpaces

type LabelTooltipIconProps = {
  tooltip?: Omit<TooltipProps, 'children'>
}

export const LabelTooltipIcon = ({ tooltip }: LabelTooltipIconProps) =>
  tooltip && (
    <Tooltip arrow placement="top" {...tooltip}>
      <InfoOutlinedIcon sx={{ marginLeft: Spacing.xxs, width: IconSize.xs, height: IconSize.xs }} />
    </Tooltip>
  )
