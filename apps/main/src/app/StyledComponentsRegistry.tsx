'use client'
import { ReactNode, useState } from 'react'
import { useServerInsertedHTML } from 'next/navigation'
import { ServerStyleSheet, StyleSheetManager } from 'styled-components'
import { shouldForwardProp } from '@ui/styled-containers'

/**
 * Injections for styled-components to work with Next.js SSR
 * Based on https://nextjs.org/docs/app/building-your-application/styling/css-in-js#styled-components
 */
export function StyledComponentsRegistry({ children }: { children: ReactNode }) {
  // Only create stylesheet once with lazy initial state
  // x-ref: https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet())

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement()
    styledComponentsStyleSheet.instance.clearTag()
    return styles
  })

  return (
    <StyleSheetManager
      shouldForwardProp={shouldForwardProp}
      {...(typeof window == 'undefined' && { sheet: styledComponentsStyleSheet.instance })}
    >
      {children}
    </StyleSheetManager>
  )
}
