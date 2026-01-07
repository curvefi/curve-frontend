import { useRef } from 'react'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import useResizeObserver from '@ui-kit/hooks/useResizeObserver'
import { ChevronDownIcon } from '@ui-kit/shared/icons/ChevronDownIcon'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Spinner } from './Spinner'

const { Spacing, ButtonSize, IconSize } = SizesAndSpaces

/** Represents a selectable option in the dropdown menu */
type Option<T extends string> = {
  /** Unique identifier for the option */
  id: T
  /** Display text for the option */
  label: string
}

type Props<T extends string> = {
  /** Text to display on the primary button */
  primary: string
  /** Array of options to display in the dropdown menu */
  options?: Option<T>[]
  /** Whether the dropdown menu is currently open */
  open: boolean
  /** Whether the button is disabled */
  disabled?: boolean
  /**
   * Whether an action is currently executing.
   * - false: No action executing
   * - 'primary': Primary action executing (shows spinner in dropdown toggle, primary text in main button)
   * - T: Option action executing (shows option label in main button, spinner in dropdown toggle)
   */
  executing?: false | 'primary' | T
  /** Callback fired when the primary button is clicked */
  onPrimary: () => void
  /** Callback fired when a dropdown option is selected */
  onOption?: (option: T) => void
  /** Callback fired when the dropdown should open */
  onOpen?: () => void
  /** Callback fired when the dropdown should close */
  onClose?: () => void
}

/**
 * A split button component that combines a primary action button with an optional dropdown menu.
 * The dropdown opens upward from the right side and contains additional action options.
 *
 * Menu implementation based on https://mui.com/material-ui/react-menu/#basic-menu
 */
export const ButtonMenu = <T extends string>({
  primary,
  options = [],
  open,
  disabled = false,
  executing = false,
  onPrimary,
  onOption,
  onOpen,
  onClose,
}: Props<T>) => {
  const anchorEl = useRef<HTMLDivElement>(null)
  const [stackWidth] = useResizeObserver(anchorEl) ?? []
  const isDisabled = disabled || executing != false

  return (
    <Stack ref={anchorEl} direction="row" gap={'1px'}>
      <Button color="primary" disabled={isDisabled} sx={{ flexGrow: 1 }} onClick={onPrimary}>
        {executing == false || executing == 'primary' ? primary : options.find((x) => x.id === executing)?.label || '?'}
      </Button>

      {options.length > 0 && (
        <Button
          color="primary"
          disabled={isDisabled}
          sx={{ width: ButtonSize.md, height: ButtonSize.md, minWidth: 'unset' }}
          onClick={onOpen}
        >
          {executing ? <Spinner /> : <ChevronDownIcon sx={{ width: IconSize.lg, height: IconSize.lg }} />}
        </Button>
      )}

      {options.length > 0 && (
        <Menu
          // eslint-disable-next-line react-hooks/refs
          anchorEl={anchorEl.current}
          open={open}
          onClose={onClose}
          // Modify anchor and transform to open upwards from the right
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          slotProps={{
            paper: {
              sx: {
                /**
                 * Positions the menu with a small gap above the button component.
                 *
                 * - handleBreakpoints requires Responsive type values, preventing direct interpolation
                 * - Uses CSS custom property to store spacing value for string interpolation
                 * - !important is required to override MUI's internal high-specificity styles
                 */
                ...handleBreakpoints({
                  '--options-gap': Spacing.sm,
                  transform: `translateY(calc(-1 * var(--options-gap))) !important`,
                }),

                /**
                 * Sets the menu width to match the anchor element (the button stack).
                 * By default, MUI Menu auto-sizes to fit content, but we want consistent
                 * width alignment with the trigger buttons (see Figma).
                 */
                width: stackWidth,
                ul: { padding: 0, margin: Spacing.sm },
                li: { padding: 0 },
                // I prefer this over hacking the ul into display flex (it's block by default) just for a gap
                'li + li': { marginBlock: Spacing.xs },
              },
            },
          }}
        >
          {options.map((option) => (
            <MenuItem key={option.id} onClick={() => onOption?.(option.id)}>
              <Button
                color="secondary"
                sx={{
                  flexGrow: 1,
                  overflow: 'hidden',
                  display: 'block',
                  textOverflow: 'ellipsis',
                  // We're setting display to block for the ellipsis, but that screws the lineheight,
                  // so we have to set it back to just 1 for vertical centering
                  '&': { lineHeight: '1' },
                }}
              >
                {option.label}
              </Button>
            </MenuItem>
          ))}
        </Menu>
      )}
    </Stack>
  )
}
