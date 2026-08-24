import { type ReactNode } from 'react'
import { type TabItem, type TabValue, type UseTabsOptions, useTabs } from '@evm-ui/hooks/useTabs'
import { WithWrapper } from '@evm-ui/shared/ui/WithWrapper'
import Box from '@mui/material/Box'
import { TabsSwitcher, type TabsSwitcherProps } from './TabsSwitcher'

export type FlatTabItem<Value extends TabValue, Params extends object = Record<string, never>> = Omit<
  TabItem<Value, Params>,
  'subTabs'
> & {
  subTabs?: never
}

export type TabsProps<Value extends TabValue, Params extends object = Record<string, never>> = UseTabsOptions<
  Value,
  Params
> &
  Omit<TabsSwitcherProps<Value>, 'value' | 'options' | 'onChange'> & {
    menu: readonly FlatTabItem<Value, Params>[]
    ContentWrapper?: (props: { children: ReactNode }) => ReactNode
  }

export const Tabs = <Value extends TabValue, Params extends object = Record<string, never>>({
  ContentWrapper,
  ...props
}: TabsProps<Value, Params>) => {
  const { tab, tabs, content, onChange } = useTabs(props)
  const {
    menu: _menu,
    params: _params,
    defaultValue: _defaultValue,
    value: _value,
    onChange: _onChange,
    ...tabsSwitcherProps
  } = props

  return (
    <>
      <TabsSwitcher {...tabsSwitcherProps} value={tab.value} options={tabs} onChange={onChange} />
      <WithWrapper shouldWrap={!!ContentWrapper} Wrapper={ContentWrapper ?? Box}>
        {content}
      </WithWrapper>
    </>
  )
}
