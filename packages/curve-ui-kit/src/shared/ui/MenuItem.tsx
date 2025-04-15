import { type ReactNode, useRef } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import MuiMenuItem, { type MenuItemProps as MuiMenuItemProps } from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { CheckedIcon } from '@ui-kit/shared/icons/CheckedIcon'
import { InvertOnHover } from '@ui-kit/shared/ui/InvertOnHover'

export type Item<T> = {
  label: string
  value: T
  icon: ReactNode
}

export type MenuItemProps<T> = Item<T> & {
  onSelected: (value: T) => void
  isSelected?: boolean
  isLoading?: boolean
} & Omit<MuiMenuItemProps, 'onChange'>

export function MenuItem<T>({ label, value, onSelected, isSelected, icon, isLoading, ...props }: MenuItemProps<T>) {
  const ref = useRef<HTMLLIElement | null>(null)
  return (
    <InvertOnHover hoverEl={ref.current}>
      <MuiMenuItem selected={isSelected} tabIndex={0} {...props} onClick={() => onSelected(value)} ref={ref}>
        {icon}
        <Typography sx={{ flexGrow: 1 }} variant="headingXsBold">
          {label}
        </Typography>
        {isSelected && <CheckedIcon />}
        {isLoading && <CircularProgress size={20} />}
      </MuiMenuItem>
    </InvertOnHover>
  )
}
