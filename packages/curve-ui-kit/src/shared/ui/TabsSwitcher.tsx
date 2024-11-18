import Tabs, { type TabsProps } from '@mui/material/Tabs'
import Tab, {type TabProps} from '@mui/material/Tab'
import { TabSwitcherVariants, TABS_VARIANT_CLASSES } from '@ui-kit/themes/tabs'
import Typography, { type TypographyProps } from '@mui/material/Typography'

const TABS_HEIGHTS = {
  small:'2rem',
  medium: '2.5rem',
  large: '3rem'
} as const // 32px, 40px, 48px

export type TabOption<T> = Pick<TabProps, 'label' | 'disabled' | 'icon' | 'sx'> & {
  value: T
  href?: string
}

export type TabsSwitcherProps<T> = Pick<TabsProps, 'sx'> & {
  size?: keyof typeof TABS_HEIGHTS
  variant?: TabSwitcherVariants
  muiVariant?: TabsProps['variant']
  textVariant?: TypographyProps['variant']
  value: T | undefined
  options: TabOption<T>[]
  onChange?: (value: T) => void
}

export const TabsSwitcher = <T extends string | number>({
  variant = 'contained',
  size = 'medium',
  muiVariant,
  options,
  onChange,
  value,
  textVariant,
  ...props
}: TabsSwitcherProps<T>) => (
  <Tabs
    variant={muiVariant}
    textColor="inherit"
    value={value}
    onChange={(_, newValue) => onChange?.(newValue)}
    sx={{ minHeight: TABS_HEIGHTS[size] }}
    className={TABS_VARIANT_CLASSES[variant]}
    {...props}
  >
    {options.map(({ value, label, ...props }) => (
      <Tab
        key={value}
        value={value}
        label={
          <Typography sx={{ textTransform: 'uppercase' }} variant={textVariant}>
            {label}
          </Typography>
        }
        {...props}
      />
    ))}
  </Tabs>
)
