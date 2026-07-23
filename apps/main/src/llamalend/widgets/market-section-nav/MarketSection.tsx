import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import type { MarketSectionId } from './types'

export const MarketSection = ({
  id,
  ariaLabel,
  children,
}: {
  id: MarketSectionId
  ariaLabel: string
  children: ReactNode
}) => (
  <Box
    id={id}
    component="section"
    aria-label={ariaLabel}
    data-testid={`market-section-${id}`}
    sx={{ scrollMarginTop: 'var(--detail-page-scroll-margin-top)' }}
  >
    {children}
  </Box>
)
