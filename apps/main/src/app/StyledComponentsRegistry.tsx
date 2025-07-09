'use client'
import { ReactNode } from 'react'
import { StyleSheetManager } from 'styled-components'
import { shouldForwardProp } from '@ui/styled-containers'

/**
 * Styled-components registry for React Router
 * Simplified version without Next.js SSR specific code
 */
export function StyledComponentsRegistry({ children }: { children: ReactNode }) {
  return <StyleSheetManager shouldForwardProp={shouldForwardProp}>{children}</StyleSheetManager>
}
