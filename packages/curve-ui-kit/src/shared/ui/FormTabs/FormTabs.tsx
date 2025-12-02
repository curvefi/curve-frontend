import { type ComponentType, type ReactNode, useState } from 'react'
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

type FormSubTab<Props extends object> = Pick<FormTab<Props>, 'value' | 'label' | 'component' | 'visible' | 'disabled'>

export type FormTab<Props extends object> = {
  value: string
  label: FnOrValue<Props, string>
  subTabs?: FormSubTab<Props>[]
  visible?: FnOrValue<Props, boolean>
  disabled?: FnOrValue<Props, boolean>
  component?: ComponentType<Props>
}

const createOptions = <Props extends object>(
  tabs: FormSubTab<Props>[] | undefined,
  params: Props,
): TabOption<string>[] =>
  tabs
    ?.filter(({ visible }) => applyFnOrValue(visible, params))
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
  const visible = tabs.filter(({ visible }) => applyFnOrValue(visible, params))
  return visible.find(({ value }) => value === key) ?? visible[0]
}

function useFormTabs<T extends object>({
  menu,
  defaultTab,
  params,
}: {
  menu: FormTab<T>[]
  params: T
  defaultTab: string
}) {
  const [tabKey, onChangeTab] = useState(defaultTab)
  const [subTabKey, onChangeSubTab] = useState<string>()
  const tab = selectVisible(menu, tabKey, params)
  const tabs = createOptions(menu, params)
  const subTab = tab.subTabs && selectVisible(tab.subTabs, subTabKey, params)
  const subTabs = createOptions(tab.subTabs, params)

  const Component = subTab?.component ?? tab.component
  if (!Component) throw new Error(`No component found for tab ${tab.value} and subTab ${subTab?.value}`)

  return { tab, tabs, subTabs, subTab, Component, onChangeTab, onChangeSubTab }
}

const LegacyFormWrapper = ({ children }: { children: ReactNode }) => (
  <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
    <AppFormContentWrapper>{children}</AppFormContentWrapper>
  </Stack>
)

export function FormTabs<T extends object>({
  shouldWrap,
  ...options
}: {
  menu: FormTab<T>[]
  params: T
  shouldWrap: boolean
  defaultTab: string
}) {
  const { tab, tabs, subTabs, subTab, Component, onChangeTab, onChangeSubTab } = useFormTabs(options)
  const params = options.params
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
        <Component {...params} />
      </WithWrapper>
    </Stack>
  )
}
