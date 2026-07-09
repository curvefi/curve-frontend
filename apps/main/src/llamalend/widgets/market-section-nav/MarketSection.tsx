import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import { useLayoutStore } from '@ui-kit/features/layout'
import type { MarketSectionId, MarketSectionRef } from './types'

export const MarketSection = ({
  id,
  sectionRef,
  children,
}: {
  id: MarketSectionId
  sectionRef: MarketSectionRef
  children: ReactNode
}) => {
  const navHeight = useLayoutStore(state => state.navHeight)

  return (
    <Box
      ref={sectionRef}
      id={id}
      component="section"
      data-testid={`market-section-${id}`}
      sx={{ scrollMarginTop: `calc(${navHeight}px + 9rem)` }}
    >
      {children}
    </Box>
  )
}
