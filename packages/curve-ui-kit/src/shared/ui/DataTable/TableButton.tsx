import { forwardRef } from 'react'
import IconButton from '@mui/material/IconButton'
import { keyframes } from '@mui/material/styles'
import SvgIcon from '@mui/material/SvgIcon'
import { Duration, Transition } from '@ui-kit/themes/design/0_primitives'

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
  return (
    <IconButton
      ref={ref}
      size="small"
      data-testid={testId}
      sx={(t) => ({
        border: `1px solid ${active ? t.design.Chips.Current.Outline : t.design.Button.Outlined.Default.Outline}`,
        backgroundColor: active ? t.design.Chips.Current.Fill : 'transparent',
      })}
      {...rest}
    >
      <Icon {...iconProps} />
    </IconButton>
  )
})
