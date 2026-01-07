import { type ReactNode, useRef } from 'react'
import { type ElementType } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import MuiMenuItem, { type MenuItemProps as MuiMenuItemProps, type MenuItemTypeMap } from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import { CheckedIcon } from '@ui-kit/shared/icons/CheckedIcon'
import { InvertOnHover } from '@ui-kit/shared/ui/InvertOnHover'
import type { TypographyVariantKey } from '@ui-kit/themes/typography'

export type Item<T> = {
  label: string
  value: T
  icon: ReactNode
}

export type MenuItemProps<T, RootComponent extends ElementType> = Item<T> & {
  labelVariant?: TypographyVariantKey
  onSelected?: (value: T) => void
  isSelected?: boolean
  isLoading?: boolean
} & Omit<MuiMenuItemProps<RootComponent>, 'onChange'>

export function MenuItem<T, C extends ElementType = MenuItemTypeMap['defaultComponent']>({
  label,
  value,
  onSelected,
  isSelected,
  icon,
  isLoading,
  labelVariant,
  ...props
}: MenuItemProps<T, C>) {
  const ref = useRef<HTMLLIElement | null>(null)
  return (
    <InvertOnHover hoverRef={ref}>
      <MuiMenuItem selected={isSelected} tabIndex={0} {...props} onClick={() => onSelected?.(value)}>
        {icon}
        <Typography sx={{ flexGrow: 1 }} variant={labelVariant ?? 'headingXsBold'}>
          {label}
        </Typography>
        {isSelected && <CheckedIcon />}
        {isLoading && <CircularProgress size={20} />}
      </MuiMenuItem>
    </InvertOnHover>
  )
}
