import type { UrlObject } from 'url'
import { type ComponentType, type ReactNode, useState } from 'react'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { type TabOption, TabsSwitcher, TabsSwitcherProps } from '@ui-kit/shared/ui/Tabs/TabsSwitcher'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { FormContent } from './FormContent'

type FnOrValue<Props extends object, Result> = ((props: Props) => Result | null | undefined) | Result

const applyFnOrValue = <Props extends object, Result>(
  fnOrValue: FnOrValue<Props, Result> | null | undefined,
  props: Props,
): Result | undefined =>
  (typeof fnOrValue === 'function' ? (fnOrValue as (props: Props) => Result)(props) : fnOrValue) ?? undefined

type FormSubTab<Props extends object> = Omit<FormTab<Props>, 'subTabs'>

export type FormTab<Props extends object> = {
  /** Unique value of the tab, it might be used in the URL later */
  value: string
  /** Label of the tab, can be a function that receives the form props */
  label: FnOrValue<Props, ReactNode>
  /** Optional href for tabs that should link out instead of rendering content */
  href?: FnOrValue<Props, string | UrlObject>
  /** Optional sub-tabs of the tab */
  subTabs?: FormSubTab<Props>[]
  /** Function or value to determine if the tab is visible */
  visible?: FnOrValue<Props, boolean>
  /** Function or value to determine if the tab is disabled */
  disabled?: FnOrValue<Props, boolean>
  /** Force the tab into the kebab menu */
  alwaysInKebab?: FnOrValue<Props, boolean>
  /** Component to render when the tab is selected */
  component?: ComponentType<Props>
}

const createOptions = <Props extends object>(
  tabs: FormSubTab<Props>[] | undefined,
  params: Props,
): TabOption<string>[] =>
  tabs
    ?.filter(({ visible }) => applyFnOrValue(visible, params) !== false)
    .map(({ value, label, disabled, alwaysInKebab, href }) => ({
      value,
      label: applyFnOrValue(label, params),
      disabled: applyFnOrValue(disabled, params),
      alwaysInKebab: applyFnOrValue(alwaysInKebab, params),
      href: applyFnOrValue(href, params),
    })) ?? []

const selectVisible = <Props extends object, Tab extends FormSubTab<Props>>(
  tabs: Tab[],
  key: string | undefined,
  params: Props,
) => {
  const visible = tabs.filter(({ visible }) => applyFnOrValue(visible, params) !== false)
  const result = visible.find(({ value }) => value === key) ?? visible[0]
  if (!result) throw new Error(`No visible tab found for key ${key} in menu ${tabs.map((t) => t.value).join(', ')}`)
  return result
}

type UseFormTabOptions<T extends object> = {
  menu: FormTab<T>[]
  params: T
}

/** Hook to manage form tabs and sub-tabs. */
function useFormTabs<T extends object>({ menu, params }: UseFormTabOptions<T>) {
  const [tabKey, onChangeTab] = useState<string>()
  const [subTabKey, onChangeSubTab] = useState<string>()
  const tab = selectVisible(menu, tabKey, params)
  const tabs = createOptions(menu, params)
  const subTab = tab.subTabs && selectVisible(tab.subTabs, subTabKey, params)
  const subTabs = createOptions(tab.subTabs, params)

  const components = notFalsy(subTab?.component, tab.component)
  const urls = notFalsy(subTab?.href, tab.href)
  if (components.length + urls.length != 1)
    throw new Error(`${components.length} components and ${urls.length} urls found for [${tabKey}, ${subTabKey}]`)

  const Component = components[0] || Skeleton // skeleton just for mui Tab validation, won't be rendered due to href
  return { tab, tabs, subTabs, subTab, Component, onChangeTab, onChangeSubTab }
}

const marginInline = { mobile: 'auto', desktop: 0 } as const

/** @deprecated This is only necessary until all the forms migrate to using the `FormTabs` component. **/
export const FormMargins = ({ children }: { children: ReactNode }) => (
  <Stack marginInline={marginInline}>{children}</Stack>
)

/**
 * Form wrapper that displays tabs and handles tab switching. It supports sub-tabs as well.
 * @param shouldWrap Whether to wrap the form content in a `FormContent` component
 *                   DEPRECATED: for legacy forms only, use `Form` or `FormContent` for new components
 * @param options - useFormTabs options
 */
type FormTabsProps<T extends object> = UseFormTabOptions<T> & {
  shouldWrap?: boolean
  overflow?: TabsSwitcherProps<T>['overflow']
}

export function FormTabs<T extends object>({ shouldWrap, overflow, ...options }: FormTabsProps<T>) {
  const { tab, tabs, subTabs, subTab, Component, onChangeTab, onChangeSubTab } = useFormTabs(options)
  return (
    <Stack marginInline={marginInline}>
      <TabsSwitcher variant="contained" value={tab.value} options={tabs} onChange={onChangeTab} overflow={overflow} />

      {subTab && subTabs.length > 1 && (
        <TabsSwitcher
          variant="underlined"
          value={subTab.value}
          options={subTabs}
          fullWidth
          sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}
          onChange={onChangeSubTab}
        />
      )}

      <WithWrapper shouldWrap={shouldWrap} Wrapper={FormContent}>
        <Component {...options.params} />
      </WithWrapper>
    </Stack>
  )
}
