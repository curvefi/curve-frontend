import Image from 'next/image'
import Box from '@mui/material/Box'
import { ChainOption } from './ChainSwitcher'

type ChainIconProps<TChainId> = {
  chain: ChainOption<TChainId>
  size?: number
}

/**
 * Display a chain icon for the chain switcher.
 * This is different from icons/ChainIcon because it requires a fixed size, some padding and no responsive design.
 */
export const ChainSwitcherIcon = <TChainId extends number>({
  chain: { chainId, label, src },
  size = 28,
}: ChainIconProps<TChainId>) => (
  <Box component="span" alignItems="center" display="flex" data-testid={`chain-icon-${chainId}`}>
    <Image
      alt={label}
      // onError={(evt) => (evt.target as HTMLImageElement).src = src}
      src={src}
      loading="lazy"
      width={size}
      height={size}
    />
  </Box>
)
