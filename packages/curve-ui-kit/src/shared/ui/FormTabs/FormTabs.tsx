import { useState, type ComponentType, type ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import { AppFormContentWrapper } from '@ui/AppForm'
import { type TabOption, TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'
import { WithWrapper } from '@ui-kit/shared/ui/WithWrapper'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { MaxWidth } = SizesAndSpaces

export type FormTab<Props> = {
  value: string
  label: string | ((props: Props) => string)
  subTabs?: Pick<FormTab<Props>, 'value' | 'label' | 'component'>[]
  enabled?: (props: Props) => boolean | undefined
  component?: ComponentType<Props>
}

type UseFormTabsOptions<T> = { menu: FormTab<T>[]; defaultTab: string; params: T }

function useFormTabs<T extends object>({ menu, defaultTab, params }: UseFormTabsOptions<T>) {
  const [tabKey, setTabKey] = useState<string | undefined>(defaultTab)
  const [subTabKey, setSubTabKey] = useState<string | undefined>()

  const enabledTabs = menu.filter(({ enabled }) => enabled == null || enabled(params))
  const tab = enabledTabs.find(({ value }) => value === tabKey) ?? enabledTabs[0]

  const tabs: TabOption<string>[] = enabledTabs.map(({ value, label }) => ({
    value,
    label: typeof label == 'function' ? label(params) : label,
    onClick: () => setTabKey(value),
  }))

  const subTabs: TabOption<string>[] =
    tab.subTabs?.map(({ value, label }) => ({
      value,
      label: typeof label == 'function' ? label(params) : label,
      onClick: () => setSubTabKey(value),
    })) ?? []

  const subTab = tab.subTabs?.find(({ value }) => value === subTabKey) ?? tab.subTabs?.[0]

  const Component = subTab?.component ?? tab.component
  if (!Component) throw new Error(`No component found for tab ${tab.value} and subTab ${subTab?.value}`)

  return { tab, tabs, subTabs, subTab, Component }
}

const LegacyFormWrapper = ({ children }: { children: ReactNode }) => (
  <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
    <AppFormContentWrapper>{children}</AppFormContentWrapper>
  </Stack>
)

export function FormTabs<T extends object>({
  shouldWrap,
  ...options
}: UseFormTabsOptions<T> & {
  shouldWrap: boolean
}) {
  const { tab, tabs, subTabs, subTab, Component } = useFormTabs(options)
  const params = options.params
  return (
    <Stack
      sx={{ width: { mobile: '100%', tablet: MaxWidth.actionCard }, marginInline: { mobile: 'auto', desktop: 0 } }}
    >
      <TabsSwitcher variant="contained" size="medium" value={tab.value} options={tabs} />

      {subTab && (
        <TabsSwitcher
          variant="underlined"
          size="small"
          value={subTab.value}
          options={subTabs}
          fullWidth
          sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}
        />
      )}

      <WithWrapper shouldWrap={shouldWrap} Wrapper={LegacyFormWrapper}>
        <Component {...params} />
      </WithWrapper>
    </Stack>
  )
}
