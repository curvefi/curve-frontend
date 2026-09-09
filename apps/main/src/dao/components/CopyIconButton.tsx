import { copyToClipboard } from '@evm-ui/utils'
import { Icon } from '@legacy-ui/Icon'
import { TooltipButton } from '@legacy-ui/Tooltip/TooltipButton'

type CopyIconButtonProps = { copyContent: string; tooltip: string; format?: (text: string) => string }

export const CopyIconButton = ({ copyContent, tooltip, format }: CopyIconButtonProps) => (
  <TooltipButton
    clickable
    onClick={() => void copyToClipboard(format ? format(copyContent) : copyContent)}
    noWrap
    tooltip={tooltip}
    customIcon={<Icon name="Copy" size={16} />}
  />
)
