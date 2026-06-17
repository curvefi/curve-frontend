import { useState, type RefObject } from 'react'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { Cross2Icon } from '@ui-kit/shared/icons/Cross2Icon'
import { FilterProps, TanstackTable } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DrawerHeader } from '@ui-kit/shared/ui/SwipeableDrawer/DrawerHeader'
import { DrawerItems } from '@ui-kit/shared/ui/SwipeableDrawer/DrawerItems'
import { SwipeableDrawer } from '@ui-kit/shared/ui/SwipeableDrawer/SwipeableDrawer'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { QueryProp } from '@ui-kit/types/util'
import { borderStyle, directChildrenAfterFirst } from '@ui-kit/utils'
import { LlamaMarketColumnId } from '../columns'
import { LendingMarketsFilters } from '../LendingMarketsFilters'

const { Spacing, Width, MinHeight } = SizesAndSpaces

type LlamaTableFiltersOverlayProps = {
  table: TanstackTable<LlamaMarket>
  open: boolean
  setOpen: (open: boolean) => void
  anchorRef: RefObject<HTMLDivElement | null>
  marketsQuery: QueryProp<LlamaMarket[]>
  resetFilters: () => void
  hasActiveFilters: boolean
} & FilterProps<LlamaMarketColumnId>

/** Llama market list table filters. Renders a drawer for mobile or a popover with the table filters. */
export const LlamaTableFiltersOverlay = ({
  table,
  open,
  setOpen,
  anchorRef,
  marketsQuery,
  resetFilters,
  hasActiveFilters,
  ...filterProps
}: LlamaTableFiltersOverlayProps) => {
  const isMobile = useIsMobile()
  const [testId, setTestId] = useState<string | null>(null)
  const content = <LendingMarketsFilters table={table} marketsQuery={marketsQuery} {...filterProps} />
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
      <DrawerHeader title={t`Filter markets`}>
        <Stack>{resetButton}</Stack>
      </DrawerHeader>
      <DrawerItems data-testid="drawer-filter-menu-lamalend-markets">{content}</DrawerItems>
    </SwipeableDrawer>
  ) : (
    <Popover
      open={open}
      onClose={() => setOpen(false)}
      anchorEl={() => anchorRef.current}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      slotProps={{
        paper: {
          sx: { backgroundColor: t => t.design.Layer[3].Fill, width: Width.modal.md },
        },
        transition: { onEntered: () => setTestId('table-filters-popover'), onExit: () => setTestId(null) },
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
            {t`Filter markets`}
          </Typography>
          <IconButton size="extraSmall" onClick={() => setOpen(false)} data-testid="btn-close-filters">
            <Cross2Icon />
          </IconButton>
        </Stack>
        {content}
        <Stack direction="row" sx={{ padding: Spacing.sm }}>
          {resetButton}
        </Stack>
      </Stack>
    </Popover>
  )
}
