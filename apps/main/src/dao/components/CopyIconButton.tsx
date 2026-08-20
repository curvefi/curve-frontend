import { Icon } from '@legacy-ui/Icon'
import { TooltipButton } from '@legacy-ui/Tooltip/TooltipButton'
import { copyToClipboard } from '@evm-ui/utils'

type CopyIconButtonProps = {
  copyContent: string
  tooltip: string
}

export const CopyIconButton = ({ copyContent, tooltip }: CopyIconButtonProps) => (
  <TooltipButton
    clickable
    onClick={() => void copyToClipboard(copyContent)}
    noWrap
    tooltip={tooltip}
    customIcon={<Icon name="Copy" size={16} />}
  />
)
