import type { FormPlacement } from 'evm-ui/src/widgets/DetailPageLayout/types'
import { createContext, use } from 'react'
import { assert } from '@primitives/objects.utils'
import { useIsMobile } from '@ui/hooks/useBreakpoints'

export const FormPlacementContext = createContext<FormPlacement | undefined>(undefined)

const useFormPlacement = () =>
  assert(use(FormPlacementContext), 'useFormPlacement must be used within FormPlacementProvider')

export const getIsMobileFormDrawer = (placement: FormPlacement, isMobile: boolean) =>
  placement === 'mobile-drawer' && isMobile

/** Returns true only when forms are rendered in the mobile bottom drawer layout. */
export const useIsMobileFormDrawer = () => {
  const isMobile = useIsMobile()
  const placement = useFormPlacement()
  return getIsMobileFormDrawer(placement, isMobile)
}
