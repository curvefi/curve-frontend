import IconButton from '@mui/material/IconButton'
import { ArrowsSize } from '@ui-kit/shared/icons/ArrowsSize'

export const ButtonFullscreen = ({ onToggle }: { onToggle: () => void }) => (
  <IconButton onClick={onToggle} size="small">
    <ArrowsSize />
  </IconButton>
)
