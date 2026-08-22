import { type ReactNode, useCallback, useState } from 'react'
import { BUTTON_FORM_SIZE } from '@evm-ui/features/forms/constants'
import { SwipeableDrawer } from '@evm-ui/shared/ui/SwipeableDrawer/SwipeableDrawer'
import type { TabOption } from '@evm-ui/shared/ui/Tabs/TabsSwitcher'
import { MUI_BUTTON_SIZE } from '@evm-ui/themes/components/button'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { applySxProps } from '@evm-ui/utils'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'

const { Spacing, ButtonSize } = SizesAndSpaces

type MobileFormTabsDrawerProps = {
  children: ReactNode
  value: string
  tabs: readonly TabOption<string>[]
  onSelectTab: (value: string) => void
}

export const MobileFormTabsDrawer = ({ children, value, tabs, onSelectTab }: MobileFormTabsDrawerProps) => {
  const [open, setOpen] = useState(false)
  const withFormButton = tabs.find(tab => tab.value === value)?.withFormButton ?? true

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
        data-testid="form-market-page"
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
      <SwipeableDrawer keepMounted open={open} setOpen={setOpen}>
        <Stack
          data-testid="mobile-form-drawer"
          sx={applySxProps(
            {
              paddingInline: Spacing.sm,
              paddingBlockEnd: Spacing.md,
            },
            // Reserve space for the form submit button, which is fixed to the bottom of the drawer.
            withFormButton && { marginBlockEnd: ButtonSize[MUI_BUTTON_SIZE[BUTTON_FORM_SIZE].height] },
          )}
        >
          {children}
        </Stack>
      </SwipeableDrawer>
    </>
  )
}
