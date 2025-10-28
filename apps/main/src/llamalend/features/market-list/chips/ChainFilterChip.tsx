import { useCallback, useMemo } from 'react'
import type { LlamaMarket, LlamaMarketKey } from '@/llamalend/entities/llama-markets'
import Grid from '@mui/material/Grid'
import { ChainIcon } from '@ui-kit/shared/icons/ChainIcon'
import { GridChip } from '@ui-kit/shared/ui/DataTable/chips/GridChip'
import type { FilterProps } from '@ui-kit/shared/ui/DataTable/data-table.utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { getUniqueSortedStrings } from '@ui-kit/utils/sorting'
import { LlamaMarketColumnId } from '../columns.enum'

const { Spacing } = SizesAndSpaces

export const ChainFilterChip = ({
  data,
  columnFiltersById,
  setColumnFilter,
}: {
  data: LlamaMarket[]
} & FilterProps<LlamaMarketKey>) => {
  const chains = useMemo(() => getUniqueSortedStrings(data, LlamaMarketColumnId.Chain), [data])
  const selectedChains = columnFiltersById[LlamaMarketColumnId.Chain] as string[] | undefined

  const toggleChain = useCallback(
    (chain: string) =>
      setColumnFilter(
        LlamaMarketColumnId.Chain,
        selectedChains?.includes(chain)
          ? selectedChains.length === 1
            ? undefined
            : selectedChains.filter((c) => c !== chain)
          : [...(selectedChains ?? []), chain],
      ),
    [selectedChains, setColumnFilter],
  )
  return (
    <Grid
      container
      spacing={Spacing.xs}
      size={{ mobile: 12, tablet: 'auto' }}
      sx={{
        flexWrap: { mobile: 'nowrap', tablet: 'wrap' },
        overflowX: { mobile: 'auto', tablet: 'visible' },
      }}
    >
      {chains.map((chain) => (
        <GridChip
          size="auto"
          key={chain}
          selected={selectedChains?.includes(chain) ?? false}
          toggle={() => toggleChain(chain)}
          icon={<ChainIcon blockchainId={chain} size="md" />}
          aria-label={chain}
          data-testid={`chip-chain-${chain}`}
        />
      ))}
    </Grid>
  )
}
