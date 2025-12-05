import type { IChartApi } from 'lightweight-charts'
import React, { useState, useEffect, useRef } from 'react'
import { Maximize as MaximizeIcon, Minimize as MinimizeIcon } from '@mui/icons-material'
import { IconButton, Dialog } from '@mui/material'

type BtnChartLWFullscreenProps = {
  chart: IChartApi | undefined
  children: React.ReactNode
}

/**
 * Button component that enables fullscreen mode for a chart
 *
 * When clicked, displays the chart in a fullscreen dialog.
 * The chart is automatically resized to fit the fullscreen container.
 *
 * @example
 * <BtnChartLWFullscreen chart={chart}>
 *   <div ref={chartRef} style={{ width: '100%', height: '400px' }} />
 * </BtnChartLWFullscreen>
 */
export function ButtonChartFullscreen({ chart, children }: BtnChartLWFullscreenProps) {
  const [fullscreen, setFullscreen] = useState(false)
  const [originalSize, setOriginalSize] = useState({ width: 0, height: 0 })
  const fullscreenContainerRef = useRef<HTMLDivElement>(null)

  const handleOpen = () => {
    if (!chart) return

    const parent = chart.chartElement().parentElement
    setOriginalSize({
      width: parent?.clientWidth ?? 0,
      height: parent?.clientHeight ?? 0,
    })

    setFullscreen(true)
  }

  const handleClose = () => {
    if (!chart) return

    chart.applyOptions({
      width: originalSize.width,
      height: originalSize.height,
    })

    setFullscreen(false)
  }

  // Resize chart when entering fullscreen
  useEffect(() => {
    if (!fullscreen || !chart || !fullscreenContainerRef.current) return

    const container = fullscreenContainerRef.current

    const resizeChart = () => {
      chart.applyOptions({
        width: container.clientWidth,
        height: container.clientHeight,
      })
      chart.timeScale().fitContent()
    }

    // Initial resize
    resizeChart()

    // Watch for container size changes
    const resizeObserver = new ResizeObserver(resizeChart)
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [fullscreen, chart])

  return (
    <>
      <IconButton onClick={handleOpen} disabled={!chart} size="small">
        {!fullscreen ? <MaximizeIcon /> : <MinimizeIcon />}
      </IconButton>

      <Dialog
        open={fullscreen}
        onClose={handleClose}
        maxWidth={false}
        fullScreen
        PaperProps={{
          sx: {
            backgroundColor: 'var(--c-background)',
            margin: 0,
            padding: '2rem',
            width: '100%',
            height: '100%',
          },
        }}
      >
        <div
          ref={fullscreenContainerRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {children}
        </div>
      </Dialog>
    </>
  )
}
