import type { ElementType, ReactNode } from 'react'
import Box from '@mui/material/Box'
import { applySxProps, type SxProps } from '@ui/lib/mui'

/** A hash-addressable section within a DetailPageLayout. */
export const DetailPageSection = ({
  id,
  children,
  component: Component = Box,
  sx,
}: {
  id: string
  children: ReactNode
  component?: ElementType
  sx?: SxProps
}) => (
  <Component
    id={id}
    component="section"
    sx={applySxProps({ scrollMarginTop: 'var(--detail-page-scroll-margin-top)' }, sx)}
  >
    {children}
  </Component>
)
