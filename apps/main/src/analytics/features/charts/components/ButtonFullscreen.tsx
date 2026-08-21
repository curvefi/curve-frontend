import { ArrowsSize } from '@evm-ui/shared/icons/ArrowsSize'
import IconButton from '@mui/material/IconButton'

export const ButtonFullscreen = ({ fullscreen, onToggle }: { fullscreen: boolean; onToggle: () => void }) => (
  <IconButton onClick={onToggle} size={fullscreen ? 'small' : 'extraSmall'}>
    <ArrowsSize />
  </IconButton>
)
