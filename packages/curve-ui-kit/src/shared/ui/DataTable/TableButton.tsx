import { forwardRef } from 'react'
import IconButton from '@mui/material/IconButton'
import SvgIcon from '@mui/material/SvgIcon'

/**
 * A button for controlling the DataTable.
 */
export const TableButton = forwardRef<
  HTMLButtonElement,
  {
    onClick: () => void
    active?: boolean
    loading?: boolean
    testId?: string
    icon: typeof SvgIcon
  }
>(function TableButton({ active, icon: Icon, testId, ...rest }, ref) {
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
      <Icon />
    </IconButton>
  )
})
