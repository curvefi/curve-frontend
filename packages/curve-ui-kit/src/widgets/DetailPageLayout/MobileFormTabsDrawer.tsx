import { type ReactNode, useCallback } from 'react'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { SwipeableDrawer } from '@ui-kit/shared/ui/SwipeableDrawer/SwipeableDrawer'
import type { TabOption } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, ButtonSize } = SizesAndSpaces

type MobileFormTabsDrawerProps = {
  children: ReactNode
  tabs: readonly TabOption<string>[]
  onSelectTab: (value: string) => void
}

export const MobileFormTabsDrawer = ({ children, tabs, onSelectTab }: MobileFormTabsDrawerProps) => {
  const [open, , , , setOpen] = useSwitch(false)

  const openTab = useCallback(
    (value: string) => {
      onSelectTab(value)
      setOpen(true)
    },
    [onSelectTab, setOpen],
  )

  return (
    <>
      <Stack
        data-testid="mobile-form-action-bar"
        direction="row"
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: t => t.zIndex.appBar - 2,
          gap: Spacing['3xs'],
          backgroundColor: t => t.design.Layer[1].Fill,
        }}
      >
        {tabs.map(({ value, label, disabled }) => (
          <Button
            key={value}
            disabled={disabled}
            data-testid={`mobile-form-action-${value}`}
            onClick={() => openTab(value)}
            sx={{ flex: 1 }}
          >
            {label}
          </Button>
        ))}
      </Stack>
      <SwipeableDrawer keepMounted open={!!open} setOpen={setOpen}>
        <Stack
          data-testid="mobile-form-drawer"
          sx={{
            paddingInline: Spacing.sm,
            paddingBlockEnd: Spacing.md,
            // Reserve space for the form submit button, which is fixed to the bottom of the drawer.
            marginBlockEnd: ButtonSize.md,
          }}
        >
          {children}
        </Stack>
      </SwipeableDrawer>
    </>
  )
}
