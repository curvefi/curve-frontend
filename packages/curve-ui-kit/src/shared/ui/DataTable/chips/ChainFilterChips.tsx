import Grid from '@mui/material/Grid'
import { ChainIcon } from '@ui-kit/shared/icons/ChainIcon'
import { GridChip } from '@ui-kit/shared/ui/DataTable/chips/GridChip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

/**
 * A filter component that displays blockchain network chips for single or multi-select filtering.
 *
 * Renders a horizontal row of toggleable chips, each representing a blockchain network.
 * On mobile devices, the chips scroll horizontally; on tablet and larger screens, they wrap.
 */
export const ChainFilterChips = ({
  chains,
  selectedChains,
  toggleChain,
}: {
  chains: string[]
  selectedChains: string[] | undefined
  toggleChain: (chain: string) => void
}) => (
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
