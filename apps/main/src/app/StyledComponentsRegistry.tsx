'use client'
import { ReactNode } from 'react'
import { StyleSheetManager } from 'styled-components'
import { shouldForwardProp } from '@ui/styled-containers'

/**
 * Styled-components registry
 */
export function StyledComponentsRegistry({ children }: { children: ReactNode }) {
  return <StyleSheetManager shouldForwardProp={shouldForwardProp}>{children}</StyleSheetManager>
}
