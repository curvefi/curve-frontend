import type { ReactNode } from 'react'
import { FormPlacementContext } from './FormPlacementContext'
import type { FormPlacement } from './types'

export const FormPlacementProvider = ({ children, placement }: { children: ReactNode; placement: FormPlacement }) => (
  <FormPlacementContext value={placement}>{children}</FormPlacementContext>
)
