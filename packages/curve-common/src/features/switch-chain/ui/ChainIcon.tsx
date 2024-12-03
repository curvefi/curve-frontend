import Box from '@mui/material/Box'
import Image from 'next/image'
import { ChainOption } from './ChainSwitcher'

export const ChainIcon = <TChainId extends number>({ chain: { chainId, label, src } }: { chain: ChainOption<TChainId> }) => (
  <Box component="span" alignItems="center" display="flex" marginRight="0.25rem" data-testid={`chain-icon-${chainId}`}>
    <Image
      alt={label}
      // onError={(evt) => (evt.target as HTMLImageElement).src = src}
      src={src}
      loading="lazy"
      width={28}
      height={28}
    />
  </Box>
)