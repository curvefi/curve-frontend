import type { ReactNode } from 'react'
import Box from '@mui/material/Box'

/** A hash-addressable section within a DetailPageLayout. */
export const DetailPageSection = ({ id, children }: { id: string; children: ReactNode }) => (
  <Box id={id} component="section" sx={{ scrollMarginTop: 'var(--detail-page-scroll-margin-top)' }}>
    {children}
  </Box>
)
