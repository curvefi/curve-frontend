import { useMemo } from 'react'
import { capitalize } from '@mui/material'
import Grid from '@mui/material/Grid'
import { notFalsy } from '@primitives/objects.utils'
import { NETWORK_BASE_CONFIG } from '@ui/utils'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { ChainIcon, type ChainIconProps } from '@ui-kit/shared/icons/ChainIcon'
import { GridChip } from '@ui-kit/shared/ui/DataTable/chips/GridChip'
import { getDefaultSelectableChipSize } from '@ui-kit/shared/ui/selectable-chip.utils'
import { type SelectableChipProps } from '@ui-kit/shared/ui/SelectableChip'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Chain } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

const ethereum = NETWORK_BASE_CONFIG[Chain.Ethereum].id
const CHAIN_ICON_FROM_CHIP_SIZE: Record<NonNullable<SelectableChipProps['size']>, ChainIconProps['size']> = {
  extraSmall: 'xs',
  small: 'sm',
  medium: 'md',
  large: 'lg',
  extraLarge: 'xl',
}

type ChainFilterChipsProps = {
  chains: string[]
  selectedChains: string[] | undefined
  toggleChain: (chain: string) => void
}

/**
 * Returns the chains sorted with Ethereum first, then the rest alphabetically,
 * along with their labels, click handlers, and selection states.
 */
const useSortedChains = ({ chains, selectedChains = [], toggleChain }: ChainFilterChipsProps) =>
  useMemo(
    () =>
      [...notFalsy(chains.find((c) => c === ethereum)), ...chains.filter((c) => c !== ethereum)].map((chain) => ({
        chain,
        label: capitalize(chain),
        onClick: () => toggleChain(chain),
        isSelected: selectedChains.includes(chain),
      })),
    [chains, selectedChains, toggleChain],
  )

/**
 * A filter component that displays blockchain network chips for single or multi-select filtering.
 *
 * Renders a horizontal row of toggleable chips, each representing a blockchain network.
 * On mobile devices, the chips scroll horizontally; on tablet and larger screens, they wrap.
 * Ethereum is always displayed first, followed by other chains in alphabetical order.
 */
export const ChainFilterChips = (props: ChainFilterChipsProps) => {
  const isMobile = useIsMobile()
  const selectableChipSize = getDefaultSelectableChipSize(isMobile)
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
      {useSortedChains(props).map(({ chain, label, onClick, isSelected }) => (
        <Tooltip key={chain} title={label} arrow>
          <GridChip
            size="auto"
            selectableChipSize={selectableChipSize}
            selected={isSelected}
            toggle={onClick}
            icon={<ChainIcon blockchainId={chain} size={CHAIN_ICON_FROM_CHIP_SIZE[selectableChipSize]} />}
            aria-label={label}
            data-testid={`chip-chain-${chain}`}
          />
        </Tooltip>
      ))}
    </Grid>
  )
}
