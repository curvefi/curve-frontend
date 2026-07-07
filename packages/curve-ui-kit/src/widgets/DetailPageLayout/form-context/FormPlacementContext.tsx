import { createContext, use } from 'react'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import type { FormPlacement } from '../types'

export const FormPlacementContext = createContext<FormPlacement | undefined>(undefined)

const useFormPlacement = () => {
  const placement = use(FormPlacementContext)
  if (!placement) throw new Error('useFormPlacement must be used within FormPlacementProvider')
  return placement
}

export const useIsMobileFormDrawer = () => {
  const isMobile = useIsMobile()
  return useFormPlacement() === 'mobile-drawer' && isMobile
}
