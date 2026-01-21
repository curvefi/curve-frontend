import Box from '@mui/material/Box'
import { TabsSwitcher, type TabOption } from './TabsSwitcher'

export type SubTabsSwitcherProps<T extends string | number> = {
  tabs: readonly TabOption<T>[]
  value: T | undefined
  onChange: (value: T) => void
}

/**
 * Sub tabs switcher meant to sit inside content with a horizontal divider line that stretches full width and aligns with TabsSwitcher of variant 'underlined'.
 */
export const SubTabsSwitcher = <T extends string | number>({ tabs, value, onChange }: SubTabsSwitcherProps<T>) => (
  <Box
    sx={(theme) => ({
      position: 'relative',
      width: '100%',
      // Pseudo-element keeps the divider visually aligned without padding shifts
      '&::after': {
        content: '""',
        position: 'absolute',
        inset: 'auto 0 0',
        height: '1px',
        backgroundColor: theme.design.Tabs.UnderLined.Default.Outline,
        zIndex: 0,
        pointerEvents: 'none',
      },
    })}
  >
    <TabsSwitcher
      variant="underlined"
      size="small"
      value={value}
      onChange={onChange}
      options={tabs}
      sx={{ position: 'relative', zIndex: 1 }}
    />
  </Box>
)
