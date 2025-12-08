import { type ComponentType, type ReactNode, useState } from 'react'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import Stack from '@mui/material/Stack'
import { AppFormContentWrapper } from '@ui/AppForm'
import { type TabOption, TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { MaxWidth } = SizesAndSpaces

type FnOrValue<Props extends object, Result> = ((props: Props) => Result | undefined) | Result

const applyFnOrValue = <Props extends object, R extends string | boolean>(
  fnOrValue: FnOrValue<Props, R> | undefined,
  props: Props,
): R | undefined => (typeof fnOrValue === 'function' ? fnOrValue(props) : fnOrValue)

type FormSubTab<Props extends object> = Omit<FormTab<Props>, 'subTabs'>

export type FormTab<Props extends object> = {
  /** Unique value of the tab, it might be used in the URL later */
  value: string
  /** Label of the tab, can be a function that receives the form props */
  label: FnOrValue<Props, string>
  /** Optional sub-tabs of the tab */
  subTabs?: FormSubTab<Props>[]
  /** Function or value to determine if the tab is visible */
  visible?: FnOrValue<Props, boolean>
  /** Function or value to determine if the tab is disabled */
  disabled?: FnOrValue<Props, boolean>
  /** Component to render when the tab is selected */
  component?: ComponentType<Props>
}

const createOptions = <Props extends object>(
  tabs: FormSubTab<Props>[] | undefined,
  params: Props,
): TabOption<string>[] =>
  tabs
    ?.filter(({ visible }) => applyFnOrValue(visible, params) !== false)
    .map(({ value, label, disabled }) => ({
      value,
      label: applyFnOrValue(label, params),
      disabled: applyFnOrValue(disabled, params),
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
  if (components.length != 1) throw new Error(`${components.length} components found for [${tabKey}, ${subTabKey}]`)

  return { tab, tabs, subTabs, subTab, Component: components[0], onChangeTab, onChangeSubTab }
}

/**
 * Adds a background to the form content. In the new forms we don't show the background at this level,
 * we still render AppFormContentWrapper there. However, in the new forms the accordion stays outside the background,
 * but is still co-located with the form content.
 */
const LegacyFormWrapper = ({ children }: { children: ReactNode }) => (
  <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
    <AppFormContentWrapper>{children}</AppFormContentWrapper>
  </Stack>
)

/**
 * Form wrapper that displays tabs and handles tab switching. It supports sub-tabs as well.
 */
export function FormTabs<T extends object>({ shouldWrap, ...options }: UseFormTabOptions<T> & { shouldWrap: boolean }) {
  const { tab, tabs, subTabs, subTab, Component, onChangeTab, onChangeSubTab } = useFormTabs(options)
  return (
    <Stack
      sx={{ width: { mobile: '100%', tablet: MaxWidth.actionCard }, marginInline: { mobile: 'auto', desktop: 0 } }}
    >
      <TabsSwitcher variant="contained" size="medium" value={tab.value} options={tabs} onChange={onChangeTab} />

      {subTab && (
        <TabsSwitcher
          variant="underlined"
          size="small"
          value={subTab.value}
          options={subTabs}
          fullWidth
          sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}
          onChange={onChangeSubTab}
        />
      )}

      <WithWrapper shouldWrap={shouldWrap} Wrapper={LegacyFormWrapper}>
        <Component {...options.params} />
      </WithWrapper>
    </Stack>
  )
}
