import { type ReactNode, useState } from 'react'
import type { TabOption } from '@evm-ui/shared/ui/Tabs/TabsSwitcher'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { SwipeableDrawer } from '@ui/components/SwipeableDrawer/SwipeableDrawer'
import { BUTTON_FORM_SIZE } from '@ui/features/forms/constants'
import { MUI_BUTTON_SIZE } from '@ui/features/themes/components/button'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { applySxProps } from '@ui/utils/mui'

const { Spacing, ButtonSize } = SizesAndSpaces

type MobileFormTabsDrawerProps = {
  children: ReactNode
  tabs: readonly TabOption<string>[]
  onSelectTab: (value: string) => void
  omitFormButton?: boolean
}

export const MobileFormTabsDrawer = ({ children, tabs, onSelectTab, omitFormButton }: MobileFormTabsDrawerProps) => {
  const [open, setOpen] = useState(false)
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
            onClick={() => {
              onSelectTab(value)
              setOpen(true)
            }}
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
            !omitFormButton && { marginBlockEnd: ButtonSize[MUI_BUTTON_SIZE[BUTTON_FORM_SIZE].height] },
          )}
        >
          {children}
        </Stack>
      </SwipeableDrawer>
    </>
  )
}
