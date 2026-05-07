import type { RefObject } from 'react'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { Cross2Icon } from '@ui-kit/shared/icons/Cross2Icon'
import { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketColumnId } from '../columns'
import { LendingMarketsFilters } from './LendingMarketsFilters'

const { Spacing, Width, MinHeight } = SizesAndSpaces

export const LlamaTableFiltersPopover = ({
  open,
  onClose,
  anchorRef: { current: anchorEl },
  markets,
  resetFilters,
  hiddenCount,
  ...filterProps
}: {
  open: boolean
  onClose: () => void
  anchorRef: RefObject<HTMLDivElement | null>
  markets: LlamaMarket[]
  resetFilters: () => void
  hiddenCount: number
} & FilterProps<LlamaMarketColumnId>) => (
  <Popover
    open={open}
    onClose={onClose}
    anchorEl={anchorEl}
    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
    slotProps={{
      paper: {
        sx: { backgroundColor: t => t.design.Layer[3].Fill, width: Width.modal.md },
      },
    }}
  >
    <Stack divider={<Box sx={{ borderTop: t => `1px solid ${t.design.Layer[1].Outline}` }} />}>
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
        <IconButton size="extraSmall" onClick={onClose}>
          <Cross2Icon />
        </IconButton>
      </Stack>
      <LendingMarketsFilters data={markets} {...filterProps} />
      <Stack direction="row" justifyContent="space-between" padding={Spacing.sm}>
        <Button color="ghost" size="extraSmall" onClick={resetFilters} disabled={!hiddenCount}>
          {t`Reset filters`}
        </Button>
        <Button color="outlined" size="extraSmall" onClick={onClose}>
          {t`Apply filters`}
        </Button>
      </Stack>
    </Stack>
  </Popover>
)
