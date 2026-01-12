import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import useResizeObserver from '@ui-kit/hooks/useResizeObserver'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { TabOption } from '../shared/ui/TabsSwitcher'

const { ButtonSize } = SizesAndSpaces
const kebabButtonSizePx = Number.parseFloat(ButtonSize.sm) * 16

const OVERFLOW_THRESHOLD = 1 // px

export function useTabsOverflow<T extends string | number>(
  options: readonly TabOption<T>[],
  isKebabMode: boolean,
  currentValue: T | undefined,
) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const isKebabOpen = Boolean(anchorEl)
  const tabsContainerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [tabWidths, setTabWidths] = useState<number[]>([])
  const [tabsContainerWidth] = useResizeObserver(tabsContainerRef, { threshold: 1 }) ?? []

  useLayoutEffect(() => {
    if (!isKebabMode) return
    const node = measureRef.current
    if (!node) return
    const tabNodes = Array.from(node.querySelectorAll<HTMLElement>('.MuiTab-root'))
    const widths = tabNodes.map((tabNode) => Math.ceil(tabNode.getBoundingClientRect().width))
    setTabWidths((prev) =>
      prev.length === widths.length && prev.every((width, index) => width === widths[index]) ? prev : widths,
    )
  }, [isKebabMode, options, currentValue])

  const { visibleOptions, hiddenOptions, showKebabButton } = useMemo(() => {
    if (!isKebabMode) {
      return { visibleOptions: options, hiddenOptions: [], showKebabButton: false }
    }

    const tabMeta = options.map((option, index) => ({
      option,
      index,
      width: tabWidths[index] ?? 0,
    }))

    const standardTabs = tabMeta.filter((item) => item.option.alwaysInKebab !== true)
    const hasAlwaysInKebab = tabMeta.some((item) => item.option.alwaysInKebab === true)
    const totalStandardWidth = standardTabs.reduce((sum, item) => sum + item.width, 0)
    const isOverflowing = tabsContainerWidth != null && totalStandardWidth - tabsContainerWidth >= OVERFLOW_THRESHOLD
    const shouldShowKebab = hasAlwaysInKebab || isOverflowing

    if (!shouldShowKebab) {
      return { visibleOptions: options, hiddenOptions: [], showKebabButton: false }
    }

    if (tabsContainerWidth == null) {
      const visibleOptions = options.filter((option) => !option.alwaysInKebab)
      const hiddenOptions = options.filter((option) => option.alwaysInKebab)
      return { visibleOptions, hiddenOptions, showKebabButton: true }
    }

    const availableWidth = Math.max(tabsContainerWidth - kebabButtonSizePx, 0)
    const visibleIndices = new Set<number>()
    const overflowIndices = new Set<number>()
    let usedWidth = 0
    let reachedOverflow = false

    standardTabs.forEach((item) => {
      if (reachedOverflow) {
        overflowIndices.add(item.index)
        return
      }

      if (usedWidth + item.width <= availableWidth) {
        visibleIndices.add(item.index)
        usedWidth += item.width
        return
      }

      overflowIndices.add(item.index)
      reachedOverflow = true
    })

    const visibleOptions = options.filter((_, index) => visibleIndices.has(index))
    const hiddenOptions = options.filter((option, index) => option.alwaysInKebab || overflowIndices.has(index))

    return { visibleOptions, hiddenOptions, showKebabButton: true }
  }, [isKebabMode, options, tabWidths, tabsContainerWidth])

  return {
    visibleOptions,
    hiddenOptions,
    showKebabButton,
    isKebabOpen,
    anchorEl,
    setAnchorEl,
    tabsContainerRef,
    measureRef,
  }
}
