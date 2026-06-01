import { Icon } from '@ui/Icon'
import { TooltipButton } from '@ui/Tooltip/TooltipButton'
import { copyToClipboard } from '@ui-kit/utils'

interface CopyIconButtonProps {
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
