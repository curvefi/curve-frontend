import { TooltipButton } from '@legacy-ui/Tooltip/TooltipButton'
import { CopyIcon } from '@ui/icons/CopyIcon'
import { copyToClipboard } from '@ui/lib/clipboard'

type CopyIconButtonProps = { copyContent: string; tooltip: string; format?: (text: string) => string }

export const CopyIconButton = ({ copyContent, tooltip, format }: CopyIconButtonProps) => (
  <TooltipButton
    clickable
    onClick={() => void copyToClipboard(format ? format(copyContent) : copyContent)}
    noWrap
    tooltip={tooltip}
    customIcon={<CopyIcon sx={{ fontSize: 16 }} />}
  />
)
