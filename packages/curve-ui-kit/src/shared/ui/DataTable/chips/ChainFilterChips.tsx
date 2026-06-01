import { useMemo } from 'react'
import { capitalize, Skeleton, Typography, TypographyProps } from '@mui/material'
import Grid from '@mui/material/Grid'
import { notFalsy } from '@primitives/objects.utils'
import { NETWORK_BASE_CONFIG } from '@ui/utils'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { useIncreasingLength } from '@ui-kit/hooks/useIncreasingLength'
import { t } from '@ui-kit/lib/i18n'
import { ChainIcon, type ChainIconProps } from '@ui-kit/shared/icons/ChainIcon'
import { GridChip } from '@ui-kit/shared/ui/DataTable/chips/GridChip'
import { getDefaultSelectableChipSize } from '@ui-kit/shared/ui/selectable-chip.utils'
import { type SelectableChipProps } from '@ui-kit/shared/ui/SelectableChip'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { chipSizeClickable } from '@ui-kit/themes/components/chip/mui-chip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { QueryProp } from '@ui-kit/types/util'
import { Chain } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

interface ChainFilterChipsProps {
  chainsQuery: QueryProp<string[]>
  selectedChains: string[] | undefined
  toggleChain: (chain: string) => void
}

const ethereum = NETWORK_BASE_CONFIG[Chain.Ethereum].id
const CHAIN_ICON_FROM_CHIP_SIZE: Record<NonNullable<SelectableChipProps['size']>, ChainIconProps['size']> = {
  extraSmall: 'xs',
  small: 'sm',
  medium: 'md',
  large: 'lg',
  extraLarge: 'xl',
}
const TYPOGRAPHY_VARIANT_FROM_CHIP_SIZE: Record<
  NonNullable<SelectableChipProps['size']>,
  TypographyProps['variant']
> = {
  extraSmall: 'bodyXsRegular',
  small: 'bodySRegular',
  medium: 'bodyMRegular',
  large: 'bodyMRegular',
  extraLarge: 'bodyMRegular',
}

const SkeletonChips = ({ chipSize }: { chipSize: NonNullable<SelectableChipProps['size']> }) => {
  const length = useIncreasingLength({ maxLength: 5 })
  return Array.from({ length }).map((_, i) => (
    <Skeleton
      key={`skeleton-chain-chip-${i}`}
      variant="rectangular"
      sx={{
        height: chipSizeClickable[chipSize].height,
        width: chipSizeClickable[chipSize].height,
      }}
    />
  ))
}

/**
 * Returns the chains sorted with Ethereum first, then the rest alphabetically,
 * along with their labels, click handlers, and selection states.
 */
const useSortedChains = ({ chainsQuery: { data }, selectedChains = [], toggleChain }: ChainFilterChipsProps) =>
  useMemo(
    () =>
      data &&
      [...notFalsy(data.find(c => c === ethereum)), ...data.filter(c => c !== ethereum)].map(chain => ({
        chain,
        label: capitalize(chain),
        onClick: () => toggleChain(chain),
        isSelected: selectedChains.includes(chain),
      })),
    [data, selectedChains, toggleChain],
  )

/**
 * A filter component that displays blockchain network chips for single or multi-select filtering.
 *
 * Renders a horizontal row of toggleable chips, each representing a blockchain network.
 * On mobile devices, the chips scroll horizontally; on tablet and larger screens, they wrap.
 * Ethereum is always displayed first, followed by other chains in alphabetical order.
 */
export const ChainFilterChips = (props: ChainFilterChipsProps) => {
  const {
    chainsQuery: { isLoading },
  } = props
  const isMobile = useIsMobile()
  const chipSize = getDefaultSelectableChipSize(isMobile)
  const sortedChains = useSortedChains(props)
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
      {isLoading ? (
        <SkeletonChips chipSize={chipSize} />
      ) : sortedChains ? (
        sortedChains.map(({ chain, label, onClick, isSelected }) => (
          <Tooltip key={chain} title={label} arrow>
            <GridChip
              size="auto"
              selectableChipSize={chipSize}
              selected={isSelected}
              toggle={onClick}
              icon={<ChainIcon blockchainId={chain} size={CHAIN_ICON_FROM_CHIP_SIZE[chipSize]} />}
              aria-label={label}
              data-testid={`chip-chain-${chain}`}
            />
          </Tooltip>
        ))
      ) : (
        <Typography variant={TYPOGRAPHY_VARIANT_FROM_CHIP_SIZE[chipSize]}>{t`No networks found`}</Typography>
      )}
    </Grid>
  )
}
