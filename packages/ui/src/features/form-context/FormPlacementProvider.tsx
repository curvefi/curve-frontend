import type { FormPlacement } from 'evm-ui/src/widgets/DetailPageLayout/types'
import type { ReactNode } from 'react'
import { FormPlacementContext } from './FormPlacementContext'

export const FormPlacementProvider = ({ children, placement }: { children: ReactNode; placement: FormPlacement }) => (
  <FormPlacementContext value={placement}>{children}</FormPlacementContext>
)
