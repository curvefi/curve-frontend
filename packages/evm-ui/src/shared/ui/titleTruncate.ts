import type { SxProps, Theme } from '@mui/material/styles'

// Shared responsive ellipsis styling for titles in tight table layouts.
// Gives more room on very small screens while capping width on larger ones.
export const responsiveTitleEllipsisSx: SxProps<Theme> = {
  minWidth: 0, // allow flex containers to shrink
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: 'calc(100vw - 200px)', // default
  '@media (max-width: 340px)': { maxWidth: '120px' },
}
