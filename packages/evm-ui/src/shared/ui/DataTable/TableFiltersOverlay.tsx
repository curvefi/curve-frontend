import { type ReactNode, type RefObject } from 'react'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import { useSwitch } from '@evm-ui/hooks/useSwitch'
import { t } from '@evm-ui/lib/i18n'
import { Cross2Icon } from '@evm-ui/shared/icons/Cross2Icon'
import { DrawerHeader } from '@evm-ui/shared/ui/SwipeableDrawer/DrawerHeader'
import { DrawerItems } from '@evm-ui/shared/ui/SwipeableDrawer/DrawerItems'
import { SwipeableDrawer } from '@evm-ui/shared/ui/SwipeableDrawer/SwipeableDrawer'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { borderStyle, directChildrenAfterFirst } from '@evm-ui/utils'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

const { Spacing, Width, MinHeight } = SizesAndSpaces

type TableFiltersOverlayProps = {
  anchorRef: RefObject<HTMLDivElement | null>
  children: ReactNode
  drawerTestId: string
  hasActiveFilters: boolean
  open: boolean
  resetFilters: () => void
  setOpen: (open: boolean) => void
  title: string
}

const testId = (testId: string, isReady: boolean | undefined) => isReady && ({ 'data-testid': testId } as const)

/** Renders table filters in a mobile drawer or desktop popover. */
export const TableFiltersOverlay = ({
  anchorRef,
  children,
  drawerTestId,
  hasActiveFilters,
  open,
  resetFilters,
  setOpen,
  title,
}: TableFiltersOverlayProps) => {
  const isMobile = useIsMobile()
  const [isReady, setReady, resetReady] = useSwitch()
  const resetButton = (
    <Button
      color="ghost"
      size="extraSmall"
      onClick={resetFilters}
      disabled={!hasActiveFilters}
      data-testid="btn-reset-filters"
    >
      {t`Reset filters`}
    </Button>
  )

  return isMobile ? (
    <SwipeableDrawer paperSx={{ maxHeight: SizesAndSpaces.MaxHeight.drawer }} open={open} setOpen={setOpen}>
      <DrawerHeader title={title}>
        <Stack>{resetButton}</Stack>
      </DrawerHeader>
      <DrawerItems data-testid={drawerTestId}>{children}</DrawerItems>
    </SwipeableDrawer>
  ) : (
    <Popover
      open={open}
      onClose={() => setOpen(false)}
      anchorEl={() => anchorRef.current}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      slotProps={{
        paper: {
          ...{ 'data-testid': 'table-filters-popover-root' },
          sx: { backgroundColor: t => t.design.Layer[3].Fill, width: Width.modal.md },
        },
        // Keep test IDs until exit completes so tests cannot reopen the popover during its closing transition.
        transition: { onEntered: setReady, onExited: resetReady },
      }}
    >
      <Stack sx={directChildrenAfterFirst({ borderTop: borderStyle })} {...testId('table-filters-popover', isReady)}>
        <Stack
          direction="row"
          sx={{
            gap: Spacing.sm,
            paddingInlineStart: Spacing.sm,
            minHeight: MinHeight.popoverHeader,
            justifyContent: 'space-between',
            alignItems: 'flex-end',
          }}
        >
          <Typography variant="headingXsBold" color="textSecondary" sx={{ paddingBlockEnd: Spacing.xs }}>
            {title}
          </Typography>
          <IconButton size="extraSmall" onClick={() => setOpen(false)} {...testId('btn-close-filters', isReady)}>
            <Cross2Icon />
          </IconButton>
        </Stack>
        {children}
        <Stack direction="row" sx={{ padding: Spacing.sm }}>
          {resetButton}
        </Stack>
      </Stack>
    </Popover>
  )
}
