import Box from '@mui/material/Box'
import Image from 'next/image'
import { ChainOption } from './ChainSwitcher'
import useTheme from '@mui/material/styles/useTheme'

export const ChainIcon = <TChainId extends number>({
  chain: { chainId, label, src, srcDark },
}: {
  chain: ChainOption<TChainId>
}) => {
  const { mode } = useTheme().palette
  return (
    <Box
      component="span"
      alignItems="center"
      display="flex"
      marginRight="0.25rem"
      data-testid={`chain-icon-${chainId}`}
    >
      <Image
        alt={label}
        // onError={(evt) => (evt.target as HTMLImageElement).src = src}
        src={mode === 'dark' ? srcDark : src}
        loading="lazy"
        width={28}
        height={28}
      />
    </Box>
  )
}