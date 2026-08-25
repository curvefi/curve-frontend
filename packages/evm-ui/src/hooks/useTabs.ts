import type { UrlObject } from 'url'
import { type ComponentType, createElement, type ReactNode, useCallback, useMemo, useState } from 'react'
import type { TabOption } from '@evm-ui/shared/ui/Tabs/TabsSwitcher'
import { assert } from '@primitives/objects.utils'
import { useSearchParams } from './router'

export type TabValue = string | number

export type FnOrValue<Props extends object, Result> = ((props: Props) => Result | null | undefined) | Result

export type TabItem<Value extends TabValue, Props extends object = Record<string, never>> = {
  /** Unique value of the tab, it might be used in the URL later */
  value: Value
  /** Label of the tab */
  label: ReactNode
  /** Optional href for tabs that should link out instead of rendering content */
  href?: FnOrValue<Props, string | UrlObject>
  /** Optional sub-tabs of the tab */
  subTabs?: Omit<TabItem<Value, Props>, 'subTabs'>[]
  /** Function or value to determine if the tab is visible */
  visible?: FnOrValue<Props, boolean>
  /** Function or value to determine if the tab is disabled */
  disabled?: FnOrValue<Props, boolean>
  /** Force the tab into the kebab menu */
  alwaysInKebab?: FnOrValue<Props, boolean>
  /** Component to render when the tab is selected */
  component?: ComponentType<Props>
} & Pick<TabOption<Value>, 'icon' | 'sx' | 'suffix' | 'startAdornment' | 'endAdornment'>

export type UseTabsOptions<Value extends TabValue, Props extends object = Record<string, never>> = {
  menu: readonly TabItem<Value, Props>[]
  params?: Props
} & (UncontrolledTabsOptions<Value> | ControlledTabsOptions<Value>)

type UncontrolledTabsOptions<Value extends TabValue> = {
  /** Initial selected tab value (uncontrolled mode) */
  defaultValue?: Value
  /** Never provided in uncontrolled mode */
  value?: never
  /** Callback when selected tab should change */
  onChange?: (value: Value) => void
}

type ControlledTabsOptions<Value extends TabValue> = {
  /** Never provided in controlled mode */
  defaultValue?: never
  /** Current selected tab value (controlled mode) */
  value: Value | undefined
  /** Callback when selected tab should change */
  onChange?: (value: Value) => void
}

export type TabState<Value extends TabValue, Props extends object> = {
  tab: TabItem<Value, Props>
  tabs: readonly TabOption<Value>[]
  subTabs: readonly TabOption<Value>[]
  subTab: TabItem<Value, Props> | undefined
  content: ReactNode
  onChange: (value: Value) => void
}

const EMPTY_PARAMS = {}

const applyFnOrValue = <Props extends object, Result>(
  fnOrValue: FnOrValue<Props, Result> | null | undefined,
  props: Props,
): Result | undefined =>
  (typeof fnOrValue === 'function' ? (fnOrValue as (props: Props) => Result)(props) : fnOrValue) ?? undefined

const createOptions = <Value extends TabValue, Props extends object>(
  tabs: readonly TabItem<Value, Props>[] | undefined,
  params: Props,
): TabOption<Value>[] =>
  tabs
    ?.filter(({ visible }) => applyFnOrValue(visible, params) !== false)
    .map(({ value, label, disabled, alwaysInKebab, href, icon, sx, suffix, startAdornment, endAdornment }) => ({
      value,
      label,
      disabled: applyFnOrValue(disabled, params),
      alwaysInKebab: applyFnOrValue(alwaysInKebab, params),
      href: applyFnOrValue(href, params),
      icon,
      sx,
      suffix,
      startAdornment,
      endAdornment,
    })) ?? []

const getVisibleTabs = <Value extends TabValue, Props extends object>(
  tabs: readonly TabItem<Value, Props>[] | undefined,
  params: Props,
): TabItem<Value, Props>[] => tabs?.filter(({ visible }) => applyFnOrValue(visible, params) !== false) ?? []

export const findTab = <Value extends TabValue, Props extends object>(
  tabs: readonly TabItem<Value, Props>[],
  value: Value | undefined,
): TabItem<Value, Props> | undefined => tabs.find(tab => tab.value === value) ?? tabs[0]

export const findTabValue = <Value extends TabValue, Props extends object>(
  menu: readonly TabItem<Value, Props>[],
  value: string | null,
): Value | undefined =>
  menu.find(tab => String(tab.value) === value)?.value ??
  menu.flatMap(tab => tab.subTabs ?? []).find(tab => String(tab.value) === value)?.value

export const useTabFromSearchParam = <Value extends TabValue, Props extends object>(
  menu: readonly TabItem<Value, Props>[],
  paramName = 'tab',
): Value | undefined => findTabValue(menu, useSearchParams().get(paramName))

const createContent = <Value extends TabValue, Props extends object>(
  tab: TabItem<Value, Props> | undefined,
  subTab: TabItem<Value, Props> | undefined,
  params: Props,
) => {
  if (!tab) return undefined

  const selectedTabs = subTab ? [tab, subTab] : [tab]
  const components = selectedTabs.filter(({ component }) => component).map(({ component }) => component)
  const hasHref = selectedTabs.some(({ href }) => applyFnOrValue(href, params))

  if (components.length > 1 || (components.length === 0 && !hasHref))
    throw new Error(
      `${components.length} components and ${hasHref ? 1 : 0} urls found for [${tab.value}, ${subTab?.value}]`,
    )

  const Component = components[0]
  return Component ? createElement(Component, params) : undefined
}

/** Handles selected tab value for both controlled and uncontrolled modes. */
function useTabValue<Value extends TabValue>(props: UncontrolledTabsOptions<Value> | ControlledTabsOptions<Value>) {
  const { defaultValue } = props as UncontrolledTabsOptions<Value>
  const [internalValue, setInternalValue] = useState<Value | undefined>(defaultValue)
  const { value = internalValue, onChange } = props as ControlledTabsOptions<Value>
  const handleChange = useCallback(
    (value: Value) => {
      setInternalValue(value)
      onChange?.(value)
    },
    [onChange],
  )
  return [value, handleChange] as const
}

/** Hook to manage tabs and sub-tabs. */
export function useTabs<Value extends TabValue, Props extends object = Record<string, never>>(
  props: UseTabsOptions<Value, Props>,
): TabState<Value, Props> {
  const { menu } = props
  const params = (props.params ?? EMPTY_PARAMS) as Props
  const [selectedValue, onChange] = useTabValue(props)
  return {
    onChange,
    ...useMemo(() => {
      const visibleTabs = getVisibleTabs(menu, params)
      const tab =
        visibleTabs.find(tab => getVisibleTabs(tab.subTabs, params).some(subTab => subTab.value === selectedValue)) ??
        findTab(visibleTabs, selectedValue)
      const subTab = findTab(getVisibleTabs(tab?.subTabs, params), selectedValue)

      return {
        tab: assert(tab, 'No visible tabs found'),
        tabs: createOptions(menu, params),
        subTabs: createOptions(tab?.subTabs, params),
        subTab,
        content: createContent(tab, subTab, params),
      }
    }, [menu, params, selectedValue]),
  }
}
