import type { ReactNode } from 'react'
import type { FormPlacement } from '../types'
import { FormPlacementContext } from './FormPlacementContext'

export const FormPlacementProvider = ({ children, placement }: { children: ReactNode; placement: FormPlacement }) => (
  <FormPlacementContext value={placement}>{children}</FormPlacementContext>
)
