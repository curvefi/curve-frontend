import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { createRoot, type Root } from 'react-dom/client'
import { type Theme, ThemeProvider } from '@mui/material/styles'

export function useEChartsTooltip<TData>(data: TData[], theme: Theme, renderTooltip?: (datum: TData) => ReactNode) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rootRef = useRef<Root | null>(null)
  const renderTooltipRef = useRef(renderTooltip)

  useEffect(() => {
    renderTooltipRef.current = renderTooltip
  })

  useEffect(
    () => () => {
      rootRef.current?.unmount()
      rootRef.current = null
      containerRef.current = null
    },
    [],
  )

  return useCallback(
    (params: unknown) => {
      if (!renderTooltipRef.current) return ''

      if (!containerRef.current) {
        containerRef.current = document.createElement('div')
        rootRef.current = createRoot(containerRef.current)
      }

      const dataIndex = Array.isArray(params) ? params[0]?.dataIndex : (params as { dataIndex?: number })?.dataIndex
      const datum = dataIndex != null ? data[dataIndex] : null

      if (datum && rootRef.current) {
        flushSync(() =>
          rootRef.current!.render(<ThemeProvider theme={theme}>{renderTooltipRef.current!(datum)}</ThemeProvider>),
        )
      } else {
        flushSync(() => rootRef.current?.render(null))
      }

      return containerRef.current
    },
    [data, theme],
  )
}
