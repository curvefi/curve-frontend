import type { RefObject } from 'react'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { t } from '@ui-kit/lib/i18n'
import { Cross2Icon } from '@ui-kit/shared/icons/Cross2Icon'
import { FilterIcon } from '@ui-kit/shared/icons/FilterIcon'
import { GridChip } from '@ui-kit/shared/ui/DataTable/chips/GridChip'
import { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { SelectableChip } from '@ui-kit/shared/ui/SelectableChip'
import { DrawerHeader } from '@ui-kit/shared/ui/SwipeableDrawer/DrawerHeader'
import { DrawerItems } from '@ui-kit/shared/ui/SwipeableDrawer/DrawerItems'
import { SwipeableDrawer } from '@ui-kit/shared/ui/SwipeableDrawer/SwipeableDrawer'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { QueryProp } from '@ui-kit/types/util'
import { borderStyle, directChildrenAfterFirst } from '@ui-kit/utils'
import { LlamaMarketColumnId } from '../columns'
import { LendingMarketsFilters } from '../LendingMarketsFilters'

const { Spacing, Width, MinHeight } = SizesAndSpaces

const OPEN_FILTERS_TEST_ID = 'btn-open-filters'

type LlamaTableFiltersProps = {
  open: boolean
  setOpen: (open: boolean) => void
  anchorRef: RefObject<HTMLDivElement | null>
  marketsQuery: QueryProp<LlamaMarket[]>
  resetFilters: () => void
  hasActiveFilters: boolean
  popoverFilterChipRef: RefObject<HTMLDivElement | null>
} & FilterProps<LlamaMarketColumnId>

/** Llama market list table filters. Renders a drawer for mobile or a popover with the table filters */
export const LlamaTableFilters = ({
  open,
  setOpen,
  anchorRef: { current: anchorEl },
  marketsQuery,
  resetFilters,
  hasActiveFilters,
  popoverFilterChipRef,
  ...filterProps
}: LlamaTableFiltersProps) => {
  const isMobile = useIsMobile()
  const content = <LendingMarketsFilters marketsQuery={marketsQuery} {...filterProps} />
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
    <SwipeableDrawer
      paperSx={{ maxHeight: SizesAndSpaces.MaxHeight.drawer }}
      open={open}
      setOpen={setOpen}
      button={
        <SelectableChip
          size="medium"
          selected={open}
          icon={<FilterIcon />}
          toggle={() => setOpen(true)}
          data-testid={OPEN_FILTERS_TEST_ID}
        />
      }
    >
      <DrawerHeader title={t`Filter markets`}>
        <Stack>{resetButton}</Stack>
      </DrawerHeader>
      <DrawerItems data-testid="drawer-filter-menu-lamalend-markets">{content}</DrawerItems>
    </SwipeableDrawer>
  ) : (
    <>
      <GridChip
        ref={popoverFilterChipRef}
        label={t`Filters`}
        selectableChipSize="medium"
        selected={open}
        icon={<FilterIcon />}
        toggle={() => setOpen(true)}
        data-testid={OPEN_FILTERS_TEST_ID}
      />
      <Popover
        open={open}
        onClose={() => setOpen(false)}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: { backgroundColor: t => t.design.Layer[3].Fill, width: Width.modal.md },
          },
        }}
      >
        <Stack sx={directChildrenAfterFirst({ borderTop: borderStyle })}>
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
    </>
  )
}
