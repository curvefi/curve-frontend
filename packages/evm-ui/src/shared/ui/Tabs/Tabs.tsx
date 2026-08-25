import { type ReactNode } from 'react'
import { type TabItem, type TabValue, useTabs, type UseTabsOptions } from '@evm-ui/hooks/useTabs'
import { WithWrapper } from '@evm-ui/shared/ui/WithWrapper'
import Box from '@mui/material/Box'
import { TabsSwitcher, type TabsSwitcherProps } from './TabsSwitcher'

export type TabsProps<Value extends TabValue, Params extends object = Record<string, never>> = UseTabsOptions<
  Value,
  Params
> &
  Omit<TabsSwitcherProps<Value>, 'value' | 'options' | 'onChange'> & {
    /** Enforce that this component does not implement subTabs */
    menu: readonly (Omit<TabItem<Value, Params>, 'subTabs'> & { subTabs?: never })[]
    /** Allow a wrapper around the content */
    ContentWrapper?: (props: { children: ReactNode }) => ReactNode
  }

/**
 * Simple component that calls useTabs in combination with TabsSwitcher, allowing a wrapper around the content.
 * It does not implement subTabs.
 */
export const Tabs = <Value extends TabValue, Params extends object = Record<string, never>>({
  ContentWrapper,
  ...props
}: TabsProps<Value, Params>) => {
  const { tab, tabs, content, onChange } = useTabs(props)
  return (
    <>
      <TabsSwitcher {...props} value={tab.value} options={tabs} onChange={onChange} />
      <WithWrapper shouldWrap={!!ContentWrapper} Wrapper={ContentWrapper ?? Box}>
        {content}
      </WithWrapper>
    </>
  )
}
