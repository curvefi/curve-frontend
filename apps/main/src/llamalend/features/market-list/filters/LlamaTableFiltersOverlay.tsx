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
import { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { DrawerHeader } from '@ui-kit/shared/ui/SwipeableDrawer/DrawerHeader'
import { DrawerItems } from '@ui-kit/shared/ui/SwipeableDrawer/DrawerItems'
import { SwipeableDrawer } from '@ui-kit/shared/ui/SwipeableDrawer/SwipeableDrawer'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { QueryProp } from '@ui-kit/types/util'
import { LlamaMarketColumnId } from '../columns'
import { LendingMarketsFilters } from '../LendingMarketsFilters'

const { Spacing, Width, MinHeight } = SizesAndSpaces

type LlamaTableFiltersProps = {
  open: boolean
  setOpen: (open: boolean) => void
  anchorRef: RefObject<HTMLDivElement | null>
  marketsQuery: QueryProp<LlamaMarket[]>
  resetFilters: () => void
  hasActiveFilters: boolean
} & FilterProps<LlamaMarketColumnId>

export const LlamaTableFiltersOverlay = ({
  open,
  setOpen,
  anchorRef: { current: anchorEl },
  marketsQuery,
  resetFilters,
  hasActiveFilters,
  ...filterProps
}: LlamaTableFiltersProps) => {
  const isMobile = useIsMobile()
  const content = <LendingMarketsFilters marketsQuery={marketsQuery} {...filterProps} />
  const resetButton = (
    <Button color="ghost" size="extraSmall" onClick={resetFilters} disabled={!hasActiveFilters}>
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
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      slotProps={{
        paper: {
          sx: { backgroundColor: t => t.design.Layer[3].Fill, width: Width.modal.md },
        },
      }}
    >
      <Stack sx={{ '& > * + *': { borderTop: t => `1px solid ${t.design.Layer[1].Outline}` } }}>
        <Stack
          direction="row"
          alignItems="flex-end"
          gap={Spacing.sm}
          justifyContent="space-between"
          minHeight={MinHeight.popoverHeader}
          paddingInlineStart={Spacing.sm}
        >
          <Typography variant="headingXsBold" color="textSecondary" paddingBlockEnd={Spacing.xs}>
            {t`Filter markets`}
          </Typography>
          <IconButton size="extraSmall" onClick={() => setOpen(false)}>
            <Cross2Icon />
          </IconButton>
        </Stack>
        {content}
        <Stack direction="row" padding={Spacing.sm}>
          {resetButton}
        </Stack>
      </Stack>
    </Popover>
  )
}
