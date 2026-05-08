import { forwardRef } from 'react'
import IconButton from '@mui/material/IconButton'
import SvgIcon from '@mui/material/SvgIcon'
import { LoadingAnimation, TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { IconSize } = SizesAndSpaces

/**
 * A button for controlling the DataTable.
 */
export const TableButton = forwardRef<
  HTMLButtonElement,
  {
    onClick: () => void
    rotateIcon?: boolean
    testId?: string
    icon: typeof SvgIcon
    active?: boolean
  }
>(({ active, icon: Icon, rotateIcon, testId, ...rest }, ref) => (
  <IconButton
    ref={ref}
    size="small"
    data-testid={testId}
    sx={t => ({
      /** The IconButton component is being used in the codebase as a Button component (with only the icon) or as a Chip component (like here)
       * These are represented by two different components in Figma, therefore we should properly handle both variants from mui-icon-button.ts.
       * TODO: refactor the IconButton's style from mui-icon-button.ts */
      transition: `color ${TransitionFunction}`,
      color: active || rotateIcon ? t.design.Button.Ghost.Hover.Label : t.design.Button.Ghost.Default.Label,
      '&:hover': {
        color: t.design.Button.Ghost.Hover.Label,
      },
      '&:disabled': {
        color: t.design.Button.Ghost.Disabled.Label,
      },
      '& svg': {
        width: IconSize.md,
        height: IconSize.md,
      },
    })}
    {...rest}
  >
    <Icon {...(rotateIcon && { sx: LoadingAnimation })} />
  </IconButton>
))
