import { forwardRef } from 'react'
import IconButton from '@mui/material/IconButton'
import { keyframes } from '@mui/material/styles'
import SvgIcon from '@mui/material/SvgIcon'
import { Duration, Transition, TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { IconSize } = SizesAndSpaces

const reloadSpin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`

/**
 * A button for controlling the DataTable.
 */
export const TableButton = forwardRef<
  HTMLButtonElement,
  {
    onClick: () => void
    active?: boolean
    rotateIcon?: boolean
    testId?: string
    icon: typeof SvgIcon
  }
>(function TableButton({ active, icon: Icon, rotateIcon, testId, ...rest }, ref) {
  const iconProps = rotateIcon && {
    sx: {
      animation: `${reloadSpin} ${Transition} ${Duration.LoadingAnimation}ms infinite`,
      transformOrigin: 'center',
    },
  }
  active = active || rotateIcon
  return (
    <IconButton
      ref={ref}
      size="small"
      data-testid={testId}
      sx={(t) => ({
        // TODO: refactor the IconButton's style from mui-icon-button.ts
        transition: `color ${TransitionFunction}`,
        border: `1px solid ${active ? t.design.Chips.Current.Outline : t.design.Chips.Default.Stroke}`,
        backgroundColor: active ? t.design.Chips.Current.Fill : t.design.Chips.Default.Fill,
        color: active ? t.design.Chips.Current.Label : t.design.Chips.Default.Label,
        '&:hover': {
          backgroundColor: t.design.Chips.Hover.Fill,
          color: t.design.Chips.Hover.Label,
          border: `none`,
        },
        '& svg': {
          width: IconSize.md,
          height: IconSize.md,
        },
      })}
      {...rest}
    >
      <Icon {...iconProps} />
    </IconButton>
  )
})
