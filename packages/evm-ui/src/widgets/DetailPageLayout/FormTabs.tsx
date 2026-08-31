import { type TabItem, useTabs } from '@evm-ui/hooks/useTabs'
import { TabsSwitcher, TabsSwitcherProps } from '@evm-ui/shared/ui/Tabs/TabsSwitcher'
import { WithWrapper } from '@evm-ui/shared/ui/WithWrapper'
import { applySxProps } from '@evm-ui/utils'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { useIsMobileFormDrawer } from './form-context/FormPlacementContext'
import { FormContent } from './FormContent'
import { MobileFormTabsDrawer } from './MobileFormTabsDrawer'

type FormTabBase<Props extends object> = Omit<TabItem<string, Props>, 'subTabs'> & {
  /** Whether this tab hides the standard fixed form button in the mobile drawer */
  omitFormButton?: boolean
}

type FormSubTab<Props extends object> = FormTabBase<Props>

export type FormTab<Props extends object> = FormTabBase<Props> & {
  subTabs?: readonly FormSubTab<Props>[]
}

type UseFormTabOptions<T extends object> = {
  menu: readonly FormTab<T>[]
  params: T
}

/** Hook to manage form tabs and sub-tabs. */
function useFormTabs<T extends object>({ menu, params }: UseFormTabOptions<T>) {
  const isMobileDrawer = useIsMobileFormDrawer()
  const { tab, tabs, subTabs, subTab, content, onChange } = useTabs({ menu, params })
  return { tab, tabs, subTabs, subTab, content, onChange, isMobileDrawer }
}

const marginInline = { tablet: 'auto', desktop: 0 } as const

type FormTabsProps<T extends object> = UseFormTabOptions<T> & {
  shouldWrap?: boolean
  overflow?: TabsSwitcherProps<string>['overflow']
}

/**
 * Form wrapper that displays tabs and handles tab switching. It supports sub-tabs as well.
 * @param shouldWrap Whether to wrap the form content in a `FormContent` component
 *                   DEPRECATED: for legacy forms only, use `Form` or `FormContent` for new components
 * @param overflow - the overflow mode of the tabs switcher, default is 'kebab'
 * @param options - useFormTabs options
 */
export function FormTabs<T extends object>({ shouldWrap, overflow = 'kebab', ...options }: FormTabsProps<T>) {
  const { tab, tabs, subTabs, subTab, content, onChange, isMobileDrawer } = useFormTabs(options)
  return (
    <WithWrapper
      shouldWrap={isMobileDrawer}
      Wrapper={MobileFormTabsDrawer}
      value={tab.value}
      tabs={tabs}
      onSelectTab={onChange}
      omitFormButton={options.menu.find(({ value }) => value === tab.value)?.omitFormButton}
    >
      <Stack sx={{ marginInline }}>
        {isMobileDrawer ? (
          <CardHeader title={tab.label} size="small" data-testid="mobile-form-active-action" />
        ) : (
          <TabsSwitcher variant="contained" value={tab.value} options={tabs} onChange={onChange} overflow={overflow} />
        )}
        {subTab && subTabs.length > 1 && (
          <TabsSwitcher
            variant="underlined"
            value={subTab.value}
            options={subTabs}
            overflow="fullWidth"
            sx={applySxProps(!isMobileDrawer && { backgroundColor: t => t.design.Layer[1].Fill })}
            onChange={onChange}
          />
        )}
        <WithWrapper shouldWrap={shouldWrap} Wrapper={FormContent}>
          {content}
        </WithWrapper>
      </Stack>
    </WithWrapper>
  )
}
