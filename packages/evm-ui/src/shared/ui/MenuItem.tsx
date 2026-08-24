import { type ReactNode, type ElementType, useRef } from 'react'
import { CheckedIcon } from '@evm-ui/shared/icons/CheckedIcon'
import { InvertOnHover } from '@evm-ui/shared/ui/InvertOnHover'
import type { TypographyVariantKey } from '@evm-ui/themes/typography'
import CircularProgress from '@mui/material/CircularProgress'
import MuiMenuItem, { type MenuItemProps as MuiMenuItemProps, type MenuItemTypeMap } from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'

type Item<T> = {
  label: string
  value: T
  icon: ReactNode
}

type MenuItemProps<T, RootComponent extends ElementType> = Item<T> & {
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
