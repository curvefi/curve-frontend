import { createContext, use } from 'react'
import type { FormPlacement } from '../types'

export const FormPlacementContext = createContext<FormPlacement | undefined>(undefined)

export const useFormPlacement = () => {
  const placement = use(FormPlacementContext)
  if (!placement) throw new Error('useFormPlacement must be used within FormPlacementProvider')
  return placement
}
