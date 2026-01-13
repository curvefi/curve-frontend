import { useCallback, useEffect, useState } from 'react'
import type { TransferProps } from '@/dex/components/PagePool/types'
import FormClaim from '@/dex/components/PagePool/Withdraw/components/FormClaim'
import FormUnstake from '@/dex/components/PagePool/Withdraw/components/FormUnstake'
import FormWithdraw from '@/dex/components/PagePool/Withdraw/components/FormWithdraw'
import type { FormType } from '@/dex/components/PagePool/Withdraw/types'
import useStore from '@/dex/store/useStore'
import AlertBox from '@ui/AlertBox/AlertBox'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/TabsSwitcher'
import { FormContent } from '@ui-kit/widgets/DetailPageLayout/FormContent'

const tabs: TabOption<FormType>[] = [
  { value: 'WITHDRAW', label: t`Withdraw` },
  { value: 'UNSTAKE', label: t`Unstake` },
  { value: 'CLAIM', label: t`Claim Rewards` },
]

const Withdraw = (transferProps: TransferProps) => {
  const { poolAlert, poolData } = transferProps

  const formType = useStore((state) => state.poolWithdraw.formType)
  const resetState = useStore((state) => state.poolWithdraw.resetState)
  const setStateByKey = useStore((state) => state.poolWithdraw.setStateByKey)

  const [tab, setTab] = useState<FormType>('WITHDRAW')

  const handleTabChange = useCallback(
    (tab: FormType) => {
      setStateByKey('formType', tab)
      setTab(tab)
    },
    [setStateByKey],
  )

  useEffect(() => {
    if (poolData) {
      resetState(poolData, 'WITHDRAW')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolData?.pool?.id])

  return (
    <FormContent
      header={<TabsSwitcher variant="underlined" value={tab} onChange={handleTabChange} options={tabs} fullWidth />}
    >
      {formType === 'WITHDRAW' &&
        (poolAlert?.isDisableWithdrawOnly ? (
          <AlertBox {...poolAlert}>{poolAlert.message}</AlertBox>
        ) : (
          <FormWithdraw {...transferProps} />
        ))}
      {formType === 'UNSTAKE' && <FormUnstake {...transferProps} />}
      {formType === 'CLAIM' && <FormClaim {...transferProps} />}
    </FormContent>
  )
}

export default Withdraw
