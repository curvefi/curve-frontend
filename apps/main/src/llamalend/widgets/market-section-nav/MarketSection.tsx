import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import type { MarketSectionId } from './types'

export const MarketSection = ({
  id,
  aliases = [],
  children,
}: {
  id: MarketSectionId
  aliases?: MarketSectionId[]
  children: ReactNode
}) => (
  <Box
    id={id}
    component="section"
    data-testid={`market-section-${id}`}
    sx={{ scrollMarginTop: 'var(--detail-page-scroll-margin-top)' }}
  >
    {aliases.map(alias => (
      <Box key={alias} id={alias} sx={{ scrollMarginTop: 'var(--detail-page-scroll-margin-top)' }} />
    ))}
    {children}
  </Box>
)
