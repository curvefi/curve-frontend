import { useCallback, useEffect } from 'react'
import type { TransferProps } from '@/dex/components/PagePool/types'
import { FormClaim } from '@/dex/components/PagePool/Withdraw/components/FormClaim'
import { FormUnstake } from '@/dex/components/PagePool/Withdraw/components/FormUnstake'
import { FormWithdraw } from '@/dex/components/PagePool/Withdraw/components/FormWithdraw'
import type { FormType } from '@/dex/components/PagePool/Withdraw/types'
import { useStore } from '@/dex/store/useStore'
import { type TabItem, useTabs } from '@evm-ui/hooks/useTabs'
import { t } from '@evm-ui/lib/i18n'
import { TabsSwitcher } from '@evm-ui/shared/ui/Tabs/TabsSwitcher'
import { FormContent } from '@evm-ui/widgets/DetailPageLayout/FormContent'
import { AlertBox } from '@legacy-ui/AlertBox/AlertBox'

const WithdrawTab = (transferProps: TransferProps) =>
  transferProps.poolAlert?.isDisableWithdrawOnly ? (
    <AlertBox {...transferProps.poolAlert}>{transferProps.poolAlert.message}</AlertBox>
  ) : (
    <FormWithdraw {...transferProps} />
  )

const UnstakeTab = (transferProps: TransferProps) => <FormUnstake {...transferProps} />
const ClaimTab = (transferProps: TransferProps) => <FormClaim {...transferProps} />

const menu: TabItem<FormType, TransferProps>[] = [
  { value: 'WITHDRAW', label: t`Withdraw`, component: WithdrawTab },
  { value: 'UNSTAKE', label: t`Unstake`, component: UnstakeTab },
  { value: 'CLAIM', label: t`Claim Rewards`, component: ClaimTab },
]

export const Withdraw = (transferProps: TransferProps) => {
  const { poolData } = transferProps

  const formType = useStore(state => state.poolWithdraw.formType)
  const resetState = useStore(state => state.poolWithdraw.resetState)
  const setStateByKey = useStore(state => state.poolWithdraw.setStateByKey)

  const handleTabChange = useCallback(
    (tab: FormType) => {
      setStateByKey('formType', tab)
    },
    [setStateByKey],
  )

  useEffect(() => {
    if (poolData) {
      resetState(poolData, 'WITHDRAW')
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [poolData?.pool?.id])

  const formTabs = useTabs({ menu, params: transferProps, value: formType, onChange: handleTabChange })

  return (
    <FormContent
      header={
        <TabsSwitcher
          variant="underlined"
          value={formTabs.tab.value}
          onChange={formTabs.onChange}
          options={formTabs.tabs}
          overflow="fullWidth"
        />
      }
    >
      {formTabs.content}
    </FormContent>
  )
}
