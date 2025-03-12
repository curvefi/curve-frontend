import Icon from '@ui/Icon'
import TooltipButton from '@ui/Tooltip'
import { copyToClipboard } from '@ui-kit/utils'

type CopyIconButtonProps = {
  copyContent: string
  tooltip: string
}

const CopyIconButton = ({ copyContent, tooltip }: CopyIconButtonProps) => (
  <TooltipButton
    onClick={() => copyToClipboard(copyContent)}
    noWrap
    tooltip={tooltip}
    customIcon={<Icon name="Copy" size={16} />}
  />
)

export default CopyIconButton
