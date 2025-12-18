import { type ComponentType, type ReactNode, useState } from 'react'
import { notFalsy } from '@curvefi/prices-api/objects.util'
import Stack from '@mui/material/Stack'
import { type TabOption, TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

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

const { Spacing } = SizesAndSpaces

/** Wrapper that applies margins to the form around the tabs. */
export const FormMargins = ({ children }: { children: ReactNode }) => (
  <Stack marginInline={{ mobile: 'auto', desktop: 0 }}>{children}</Stack>
)

/**
 * Wrapper that applies background and padding to the form content, including optional header and footer.
 * @param children The main content of the form
 * @param header The optional subtabs, used in legacy forms
 * @param footer The footer of the form outside the background area, used in new forms for the info accordion
 */
export const FormContent = ({
  children,
  header,
  footer,
}: {
  children: ReactNode
  footer?: ReactNode
  header?: ReactNode
}) => (
  <WithWrapper shouldWrap={footer} Wrapper={Stack} gap={Spacing.md}>
    <WithWrapper shouldWrap={header} Wrapper={Stack} sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
      {header}
      <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }} gap={Spacing.md} padding={Spacing.md}>
        {children}
      </Stack>
    </WithWrapper>
    {footer}
  </WithWrapper>
)

/**
 * Form wrapper that displays tabs and handles tab switching. It supports sub-tabs as well.
 */
export function FormTabs<T extends object>({ shouldWrap, ...options }: UseFormTabOptions<T> & { shouldWrap: boolean }) {
  const { tab, tabs, subTabs, subTab, Component, onChangeTab, onChangeSubTab } = useFormTabs(options)
  return (
    <FormMargins>
      <TabsSwitcher variant="contained" size="medium" value={tab.value} options={tabs} onChange={onChangeTab} />

      {subTab && subTabs.length > 1 && (
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

      <WithWrapper shouldWrap={shouldWrap} Wrapper={FormContent}>
        <Component {...options.params} />
      </WithWrapper>
    </FormMargins>
  )
}
