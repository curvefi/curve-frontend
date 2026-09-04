import { useMemo } from 'react'
import { useIncreasingLength } from '@evm-ui/hooks/useIncreasingLength'
import { GridChip } from '@evm-ui/shared/ui/DataTable/chips/GridChip'
import { getDefaultSelectableChipSize } from '@evm-ui/shared/ui/selectable-chip.utils'
import { NETWORK_BASE_CONFIG } from '@legacy-ui/utils'
import { capitalize, Skeleton, Typography, TypographyProps } from '@mui/material'
import Grid from '@mui/material/Grid'
import { Chain } from '@primitives/network.utils'
import { notFalsy } from '@primitives/objects.utils'
import { type SelectableChipProps } from '@ui/components/SelectableChip'
import { Tooltip } from '@ui/components/Tooltip'
import { QueryProp } from '@ui/features/queries/util'
import { chipSizeClickable } from '@ui/features/themes/components/chip/mui-chip'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { ChainIcon, type ChainIconProps } from '@ui/icons/ChainIcon'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

type ChainFilterChipsProps = {
  chainsQuery: QueryProp<string[]>
  selectedChains: string[] | undefined
  toggleChain: (chain: string) => void
}

const ETHEREUM = NETWORK_BASE_CONFIG[Chain.Ethereum].blockchainId
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

const SkeletonChips = ({ chipSize }: { chipSize: NonNullable<SelectableChipProps['size']> }) =>
  Array.from({ length: useIncreasingLength('chips') }).map((_, i) => (
    <Skeleton
      // eslint-disable-next-line @eslint-react/no-array-index-key -- Existing violation before enabling this rule.
      key={`skeleton-chain-chip-${i}`}
      variant="rectangular"
      sx={{
        height: chipSizeClickable[chipSize].height,
        width: chipSizeClickable[chipSize].height,
      }}
    />
  ))

/**
 * Returns the chains sorted with Ethereum first, then the rest alphabetically,
 * along with their labels, click handlers, and selection states.
 */
const useSortedChains = ({ chainsQuery: { data }, selectedChains = [], toggleChain }: ChainFilterChipsProps) =>
  useMemo(
    () =>
      data &&
      [...notFalsy(data.find(c => c === ETHEREUM)), ...data.filter(c => c !== ETHEREUM)].map(chain => ({
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
