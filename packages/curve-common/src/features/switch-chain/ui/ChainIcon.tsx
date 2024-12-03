import Box from '@mui/material/Box'
import Image from 'next/image'

export const ChainIcon = ({ label, src, size }: { label: string; src: string; size: number }) => (
  <Box component="span" alignItems="center" display="flex" marginRight="0.25rem">
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