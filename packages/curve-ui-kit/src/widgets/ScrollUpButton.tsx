import Button from '@mui/material/Button'
import { useLayoutStore } from '@ui-kit/features/layout'
import { PinTopIcon } from '@ui-kit/shared/icons/PinTopIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { ButtonSize } = SizesAndSpaces

export const ScrollUpButton = () => {
  const isShowScrollButton = useLayoutStore((state) => state.showScrollButton)

  return (
    <Button
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
        inset: 'auto 4rem 4rem auto',

        // Make sure it's always on top
        zIndex: 'var(--z-index-page-settings)',

        // Make a perfectly square button
        minWidth: 'unset',
        width: ButtonSize.md,
        height: ButtonSize.md,

        // Fade in and out animation
        opacity: isShowScrollButton ? 1 : 0,
        scale: isShowScrollButton ? 1 : 0.5,
        transition: 'opacity .25s, scale .25s',

        // Disable pointer events when hidden, so it doesn't block other elements
        // Avoid using display: none for better animation (fade out)
        pointerEvents: isShowScrollButton ? 'auto' : 'none',
      }}
    >
      <PinTopIcon />
    </Button>
  )
}
