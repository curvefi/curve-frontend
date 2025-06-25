import type { UrlObject } from 'url'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { MouseEvent, type ReactNode, useMemo } from 'react'
import Tab, { type TabProps } from '@mui/material/Tab'
import Tabs, { type TabsProps } from '@mui/material/Tabs'
import Typography, { type TypographyProps } from '@mui/material/Typography'
import type { TypographyVariantKey } from '@ui-kit/themes/typography'
import { pushSearchParams } from '@ui-kit/utils/urls'
import {
  TABS_HEIGHT_CLASSES,
  HIDE_INACTIVE_BORDERS_CLASS,
  TABS_VARIANT_CLASSES,
  TabSwitcherVariants,
} from '../../themes/components/tabs'

const defaultTextVariants = {
  small: 'buttonS',
  medium: 'buttonM',
  large: 'headingMBold',
} as const satisfies Record<keyof typeof TABS_HEIGHT_CLASSES, TypographyVariantKey>

export type TabOption<T> = Pick<TabProps, 'label' | 'disabled' | 'icon' | 'sx'> & {
  value: T
  href: string | UrlObject
}

export type TabsSwitcherProps<T> = Pick<TabsProps, 'sx'> & {
  size?: keyof typeof TABS_HEIGHT_CLASSES
  variant?: TabSwitcherVariants
  muiVariant?: TabsProps['variant']
  textVariant?: TypographyProps['variant']
  value: T | undefined
  options: readonly TabOption<T>[]
  hideInactiveBorders?: boolean
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
  hideInactiveBorders = false,
  ...props
}: TabsSwitcherProps<T>) => (
  <Tabs
    variant={muiVariant}
    textColor="inherit"
    value={value ?? false}
    onChange={(_, newValue) => onChange?.(newValue)}
    className={`${TABS_VARIANT_CLASSES[variant]} ${TABS_HEIGHT_CLASSES[size]} ${hideInactiveBorders && HIDE_INACTIVE_BORDERS_CLASS}`}
    {...props}
  >
    {options.map(({ value, label, sx, ...props }) => (
      <Tab
        key={value}
        value={value}
        component={Link}
        label={<Typography variant={textVariant ?? defaultTextVariants[size]}>{label}</Typography>}
        sx={{ ...sx, whiteSpace: 'nowrap' }}
        {...props}
      />
    ))}
  </Tabs>
)

export function useTabFromUrl<T extends string | number>(
  tabs: readonly { value: T; label: ReactNode }[],
  defaultTab: T,
) {
  const pathname = usePathname()
  const urlTab = useSearchParams()?.get('tab')
  const currentTab = useMemo(
    () => tabs.find((t) => `${t.value}` === urlTab)?.value ?? defaultTab,
    [tabs, urlTab, defaultTab],
  )
  const all = useMemo(
    () => [
      ...tabs.map(({ value, ...props }) => ({
        ...props,
        value,
        href: { query: { tab: value }, pathname },
        onClick: (e: MouseEvent<HTMLAnchorElement>) => pushSearchParams(e, { tab: value }),
      })),
    ],
    [tabs, pathname],
  )
  return [currentTab, all] as const
}
