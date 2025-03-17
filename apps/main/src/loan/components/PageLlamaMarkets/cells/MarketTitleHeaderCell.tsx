import type { LlamaMarket } from '@/loan/entities/llama-markets'
import Stack from '@mui/material/Stack'
import { HeaderContext } from '@tanstack/react-table'
import { t } from '@ui-kit/lib/i18n'
import { SearchField } from '@ui-kit/shared/ui/SearchField'

export const MarketTitleHeaderCell = ({
  table: {
    options: { meta },
  },
  column,
}: HeaderContext<LlamaMarket, LlamaMarket['assets']>) => (
  <Stack>
    <SearchField
      onSearch={(search) => meta!.setColumnFilter(column.id, search)}
      size="small"
      data-testid="llama-text-search"
    />
    {t`Collateral • Borrow`}
  </Stack>
)
