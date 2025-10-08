import { useEffect } from 'react'

/**
 * Custom hook to set the document title for markets pages
 * @param collateralSymbol - The symbol of the collateral token
 * @param prefix - The prefix part of the title (e.g., "Create - ...")
 */
export function useLendPageTitle(collateralSymbol: string | undefined, prefix: string) {
  useEffect(() => {
    if (collateralSymbol) {
      document.title = `${prefix} - ${collateralSymbol} - Curve Llamalend`
    }
  }, [collateralSymbol, prefix])
}
