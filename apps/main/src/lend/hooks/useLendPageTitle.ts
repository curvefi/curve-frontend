import { useEffect } from 'react'
import { notFalsy } from '@curvefi/primitives/objects.utils'

/**
 * Custom hook to set the document title for markets pages
 * @param collateralSymbol - The symbol of the collateral token
 * @param prefix - The prefix part of the title (e.g., "Supply - ...")
 */
export function useLendPageTitle(collateralSymbol: string | undefined, prefix?: string) {
  useEffect(() => {
    document.title = notFalsy(prefix, collateralSymbol, `Curve Llamalend`).join(' - ')
  }, [collateralSymbol, prefix])
}
