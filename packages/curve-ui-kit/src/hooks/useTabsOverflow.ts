import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import useResizeObserver from '@ui-kit/hooks/useResizeObserver'
import type { TabOption } from '../shared/ui/TabsSwitcher'
import { partition } from 'lodash'
import { splitAt } from '@ui-kit/utils/array'
import { CONTAINED_TABS_MARGIN_RIGHT } from '@ui-kit/themes/components/tabs/mui-tabs'

// threshold from when the tabs start to overflow
const OVERFLOW_THRESHOLD = 0 // px
const MUI_TAB_SELECTOR = '.MuiTab-root'

export function useTabsOverflow<T extends string | number>(
  options: readonly TabOption<T>[],
  isKebabMode: boolean,
  currentValue: T | undefined,
) {
  const visibleTabsRef = useRef<HTMLDivElement>(null)
  const [tabsContainerWidth] = useResizeObserver(visibleTabsRef, { threshold: 1 }) ?? []
  const [tabWidths, setTabWidths] = useState<number[]>([])

  useLayoutEffect(() => {
    const node = visibleTabsRef.current
    if (node && isKebabMode) {
      const widths = Array.from(node.querySelectorAll<HTMLElement>(MUI_TAB_SELECTOR)).map(
        (tabNode) => tabNode.getBoundingClientRect().width,
      )
      setTabWidths(widths)
    }
  }, [isKebabMode, options, currentValue, tabsContainerWidth])

  const { renderedOptions, visibleOptions, hiddenOptions } = useMemo(() => {
    if (!isKebabMode) {
      return { renderedOptions: options, visibleOptions: options, hiddenOptions: [] }
    }

    const [alwaysInKebabOptions, standardOptions] = partition(options, (option) => option.alwaysInKebab)

    if (!tabsContainerWidth || !tabWidths.length) {
      return {
        renderedOptions: standardOptions,
        visibleOptions: standardOptions,
        hiddenOptions: alwaysInKebabOptions,
      }
    }

    const lastIndex = standardOptions.length - 1
    let totalWidth = 0
    const overflowIndex = standardOptions.findIndex((option, index) => {
      const margin = option.value !== currentValue && index !== lastIndex ? CONTAINED_TABS_MARGIN_RIGHT : 0
      totalWidth += (tabWidths[index] ?? 0) + margin
      return totalWidth - tabsContainerWidth >= OVERFLOW_THRESHOLD
    })
    const [visibleOptions, overflowOptions] = splitAt(
      standardOptions,
      overflowIndex === -1 ? standardOptions.length : overflowIndex,
    )

    return {
      renderedOptions: standardOptions,
      visibleOptions,
      hiddenOptions: [...overflowOptions, ...alwaysInKebabOptions],
    }
  }, [currentValue, isKebabMode, options, tabWidths, tabsContainerWidth])

  return {
    renderedOptions,
    visibleOptions,
    hiddenOptions,
    visibleTabsRef,
  }
}
