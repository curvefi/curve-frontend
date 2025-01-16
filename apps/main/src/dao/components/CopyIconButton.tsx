import { copyToClipboard } from '@/dao/utils'

import TooltipButton from '@ui/Tooltip'
import Icon from '@ui/Icon'

type CopyIconButtonProps = {
  copyContent: string
  tooltip: string
}

const CopyIconButton = ({ copyContent, tooltip }: CopyIconButtonProps) => {
  const handleCopyClick = (copyContent: string) => {
    copyToClipboard(copyContent)
  }

  return (
    <TooltipButton
      onClick={() => handleCopyClick(copyContent)}
      noWrap
      tooltip={tooltip}
      customIcon={<Icon name="Copy" size={16} />}
    />
  )
}

export default CopyIconButton
