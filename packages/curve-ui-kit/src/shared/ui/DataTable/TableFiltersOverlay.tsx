import { useState, type ReactNode, type RefObject } from 'react'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { Cross2Icon } from '@ui-kit/shared/icons/Cross2Icon'
import { DrawerHeader } from '@ui-kit/shared/ui/SwipeableDrawer/DrawerHeader'
import { DrawerItems } from '@ui-kit/shared/ui/SwipeableDrawer/DrawerItems'
import { SwipeableDrawer } from '@ui-kit/shared/ui/SwipeableDrawer/SwipeableDrawer'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { borderStyle, directChildrenAfterFirst } from '@ui-kit/utils'

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
  const [events, setEvents] = useState<[Date, string][]>([])
  const [testId, setTestId] = useState<string | null>(null)
  const appendEvent = (event: string) => setEvents(prev => [...prev, [new Date(), event]])
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

  const elements = events.map(([d, e], i) => (
    <div key={i}>
      {d.toISOString()}: {e}
    </div>
  ))
  return (
    <>
      {elements}
      {isMobile ? (
        <SwipeableDrawer paperSx={{ maxHeight: SizesAndSpaces.MaxHeight.drawer }} open={open} setOpen={setOpen}>
          <DrawerHeader title={title}>
            <Stack>{resetButton}</Stack>
          </DrawerHeader>
          <DrawerItems data-testid={drawerTestId}>{children}</DrawerItems>
        </SwipeableDrawer>
      ) : (
        <Popover
          open={open}
          onClose={() => {
            setOpen(false)
            appendEvent('setOpen(false)')
          }}
          anchorEl={() => anchorRef.current}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          slotProps={{
            paper: {
              sx: { backgroundColor: t => t.design.Layer[3].Fill, width: Width.modal.md },
            },
            // Set the test ID once transition is ready to avoid flaky tests clicking during transition.
            transition: {
              onEntered: () => {
                setTestId('table-filters-popover')
                appendEvent('setTestId("table-filters-popover")')
              },
              onExit: () => {
                setTestId(null)
                appendEvent('setTestId(null)')
              },
            },
          }}
        >
          <Stack sx={directChildrenAfterFirst({ borderTop: borderStyle })} data-testid={testId}>
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
              <IconButton
                size="extraSmall"
                onClick={() => {
                  setOpen(false)
                  appendEvent('setOpen(false)')
                }}
                data-testid="btn-close-filters"
              >
                <Cross2Icon />
              </IconButton>
            </Stack>
            {children}
            <Stack direction="row" sx={{ padding: Spacing.sm }}>
              {resetButton}
            </Stack>
          </Stack>
          {elements}
        </Popover>
      )}
    </>
  )
}
