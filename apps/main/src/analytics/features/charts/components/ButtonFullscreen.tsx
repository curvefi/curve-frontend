import IconButton from '@mui/material/IconButton'
import { ArrowsSize } from '@ui-kit/shared/icons/ArrowsSize'

export const ButtonFullscreen = ({ fullscreen, onToggle }: { fullscreen: boolean; onToggle: () => void }) => (
  <IconButton onClick={onToggle} size={fullscreen ? 'small' : 'extraSmall'}>
    <ArrowsSize />
  </IconButton>
)
