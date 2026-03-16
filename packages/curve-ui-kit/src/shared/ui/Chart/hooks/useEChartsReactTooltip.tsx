import { useCallback, useEffect, useRef, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { type Theme, ThemeProvider } from '@mui/material/styles'

export function useEChartsReactTooltip<TData>(
  data: TData[],
  theme: Theme,
  renderTooltip?: (datum: TData) => ReactNode,
) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const rootRef = useRef<Root | null>(null)

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
      if (!renderTooltip) return ''

      if (!containerRef.current) {
        containerRef.current = document.createElement('div')
        rootRef.current = createRoot(containerRef.current)
      }

      const dataIndex = Array.isArray(params) ? params[0]?.dataIndex : (params as { dataIndex?: number })?.dataIndex
      const datum = dataIndex != null ? data[dataIndex] : null

      if (datum && rootRef.current) {
        rootRef.current.render(<ThemeProvider theme={theme}>{renderTooltip(datum)}</ThemeProvider>)
      } else {
        rootRef.current?.render(null)
      }

      return containerRef.current
    },
    [data, renderTooltip, theme],
  )
}
