import { partition, sumBy } from 'lodash'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import useResizeObserver from '@ui-kit/hooks/useResizeObserver'
import { CONTAINED_TABS_MARGIN_RIGHT } from '@ui-kit/themes/components/tabs/mui-tabs'
import { splitAtFirst } from '@ui-kit/utils/array'
import type { TabOption } from '../shared/ui/Tabs/TabsSwitcher'
import { useSwitch } from './useSwitch'

// threshold from when the tabs start to overflow
const OVERFLOW_THRESHOLD = 0 // px
const MUI_TAB_SELECTOR = '.MuiTab-root'

/**
 * Hook to handle tabs overflow.
 * The rendered options are the Tabs that are rendered, but not necessarily visible.
 * The visible options are the rendered Tabs that are visible and clickable.
 * The hidden options are the Tabs that are rendered inside the kebab menu.
 * @param options - The options to render.
 * @param isKebabMode - Whether the tabs are in kebab mode.
 */
export function useTabsOverflow<T extends string | number>(options: readonly TabOption<T>[], isKebabMode: boolean) {
  const [kebabMenuOpen, openKebabMenu, closeKebabMenu] = useSwitch()
  const visibleTabsRef = useRef<HTMLDivElement>(null)
  const kebabTabRef = useRef<HTMLDivElement | null>(null)
  const [tabsContainerWidth] = useResizeObserver(visibleTabsRef, { threshold: 1 }) ?? []
  const [tabWidths, setTabWidths] = useState<number[]>([])

  useLayoutEffect(() => {
    const node = visibleTabsRef.current
    if (node && isKebabMode && tabsContainerWidth) {
      const widths = Array.from(node.querySelectorAll<HTMLElement>(MUI_TAB_SELECTOR)).map(
        (tabNode) => tabNode.getBoundingClientRect().width,
      )
      setTabWidths(widths)
    }
  }, [isKebabMode, options, tabsContainerWidth])

  const { renderedOptions, visibleOptions, hiddenOptions } = useMemo(() => {
    if (!isKebabMode) {
      return { renderedOptions: options, visibleOptions: options, hiddenOptions: [] }
    }
    const [alwaysInKebabOptions, standardOptions] = partition(options, (option) => option.alwaysInKebab)

    if (tabsContainerWidth && tabWidths.length) {
      const standardOptionsWithWidth = standardOptions.map((option, index) => ({
        ...option,
        width: tabWidths[index] ?? 0,
      }))

      const [visibleOptions, overflowOptions] = splitAtFirst(standardOptionsWithWidth, (_, index) => {
        const currentWidth = sumBy(
          standardOptionsWithWidth.slice(0, index + 1),
          // contained tabs have an additional margin to the right. Actually the selected tab and the last one do not have this margin, but it's ignored here
          (option) => option.width + CONTAINED_TABS_MARGIN_RIGHT,
        )
        return currentWidth - tabsContainerWidth >= OVERFLOW_THRESHOLD
      })

      const [firstOption, ...restOverflow] = overflowOptions
      // always make visible at least one tab, this is to avoid infinite loop of rendering/not rendering the kebab menu
      // when screen size very small or parent node has no width
      const hasVisibleTabs = visibleOptions.length > 0 || !firstOption

      return {
        renderedOptions: standardOptions,
        visibleOptions: hasVisibleTabs ? visibleOptions : [firstOption],
        hiddenOptions: [...(hasVisibleTabs ? overflowOptions : restOverflow), ...alwaysInKebabOptions],
      }
    }

    return {
      renderedOptions: standardOptions,
      visibleOptions: standardOptions,
      hiddenOptions: alwaysInKebabOptions,
    }
  }, [isKebabMode, options, tabWidths, tabsContainerWidth])

  return {
    renderedOptions,
    visibleOptions,
    hiddenOptions,
    visibleTabsRef,
    kebabTabRef,
    kebabMenuOpen,
    openKebabMenu,
    closeKebabMenu,
  }
}
