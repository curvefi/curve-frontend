import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Tab, { type TabProps } from '@mui/material/Tab'
import Tabs, { type TabsProps } from '@mui/material/Tabs'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import type { TypographyVariantKey } from '@ui-kit/themes/typography'
import { pushSearchParams } from '@ui-kit/utils/urls'
import { TABS_HEIGHT_CLASSES, TABS_VARIANT_CLASSES, TabSwitcherVariants } from '../../themes/components/tabs'

const defaultTextVariants = {
  small: 'buttonS',
  medium: 'buttonM',
  large: 'headingMBold',
} as const satisfies Record<keyof typeof TABS_HEIGHT_CLASSES, TypographyVariantKey>

export type TabOption<T> = Pick<TabProps, 'label' | 'disabled' | 'icon' | 'sx'> & {
  value: T
}

export type TabsSwitcherProps<T> = Pick<TabsProps, 'sx'> & {
  size?: keyof typeof TABS_HEIGHT_CLASSES
  variant?: TabSwitcherVariants
  muiVariant?: TabsProps['variant']
  textVariant?: TypographyProps['variant']
  value: T | undefined
  options: readonly TabOption<T>[]
  onChange?: (value: T) => void
}

export const TabsSwitcher = <T extends string | number>({
  variant = 'contained',
  size = 'small',
  muiVariant,
  options,
  onChange,
  value,
  textVariant,
  ...props
}: TabsSwitcherProps<T>) => {
  const pathname = usePathname()
  return (
    <Tabs
      variant={muiVariant}
      textColor="inherit"
      value={value ?? false}
      onChange={(_, newValue) => onChange?.(newValue)}
      className={`${TABS_VARIANT_CLASSES[variant]} ${TABS_HEIGHT_CLASSES[size]}`}
      {...props}
    >
      {options.map(({ value: tab, label, sx, ...props }) => (
        <Tab
          key={tab}
          value={tab}
          component={Link}
          href={{ query: { tab }, pathname }}
          label={<Typography variant={textVariant ?? defaultTextVariants[size]}>{label}</Typography>}
          sx={{ ...sx, whiteSpace: 'nowrap' }}
          onClick={(e) => pushSearchParams(e, { tab })}
          {...props}
        />
      ))}
    </Tabs>
  )
}
