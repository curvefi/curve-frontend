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
    // eslint-disable-next-line @typescript-eslint/no-misused-promises -- Existing violation before enabling this rule.
    onClick={() => copyToClipboard(copyContent)}
    noWrap
    tooltip={tooltip}
    customIcon={<Icon name="Copy" size={16} />}
  />
)
