import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Tooltip, type TooltipProps } from './Tooltip'

const { IconSize } = SizesAndSpaces

type LabelTooltipIconProps = {
  tooltip?: Omit<TooltipProps, 'children'>
}

export const LabelTooltipIcon = ({ tooltip }: LabelTooltipIconProps) =>
  tooltip ? (
    <Tooltip arrow placement="top" {...tooltip}>
      <span>
        {' '}
        <InfoOutlinedIcon sx={{ width: IconSize.xs, height: IconSize.xs }} />
      </span>
    </Tooltip>
  ) : null
