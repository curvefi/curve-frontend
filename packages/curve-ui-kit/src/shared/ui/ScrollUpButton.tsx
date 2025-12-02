import { mapRecord } from '@curvefi/prices-api/objects.util'
import Button from '@mui/material/Button'
import { PinTopIcon } from '@ui-kit/shared/icons/PinTopIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { ButtonSize, Inset } = SizesAndSpaces

export const ScrollUpButton = ({ visible }: { visible: boolean }) => (
  <Button
    // This specific variant is why we want a normal button, and not an icon button
    variant="contained"
    onClick={() =>
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth',
      })
    }
    sx={{
      // Put on the bottom right corner
      position: 'fixed',
      inset: mapRecord(Inset.scrollUpButton, (breakpoint, value) =>
        ((inset) => `auto ${inset} ${inset} auto`)(value, breakpoint),
      ),

      // Make sure it's always on top
      zIndex: 'var(--z-index-page-settings)',

      // Make a perfectly square button
      minWidth: 'unset',
      width: ButtonSize.md,
      height: ButtonSize.md,

      // Fade in and out animation
      opacity: visible ? 1 : 0,
      scale: visible ? 1 : 0.5,
      transition: 'opacity .25s, scale .25s',

      // Disable pointer events when hidden, so it doesn't block other elements
      // Avoid using display: none for better animation (fade out)
      pointerEvents: visible ? 'auto' : 'none',
    }}
  >
    <PinTopIcon />
  </Button>
)
