import { useCallback, useEffect, useState } from 'react'
import type { TransferProps } from '@/dex/components/PagePool/types'
import FormClaim from '@/dex/components/PagePool/Withdraw/components/FormClaim'
import FormUnstake from '@/dex/components/PagePool/Withdraw/components/FormUnstake'
import FormWithdraw from '@/dex/components/PagePool/Withdraw/components/FormWithdraw'
import type { FormType } from '@/dex/components/PagePool/Withdraw/types'
import useStore from '@/dex/store/useStore'
import { AppFormContentWrapper } from '@ui/AppForm'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'

const Withdraw = (transferProps: TransferProps) => {
  const { poolData } = transferProps

  const formType = useStore((state) => state.poolWithdraw.formType)
  const resetState = useStore((state) => state.poolWithdraw.resetState)
  const setStateByKey = useStore((state) => state.poolWithdraw.setStateByKey)

  const TABS: { value: FormType; label: string }[] = [
    { value: 'WITHDRAW', label: t`Withdraw` },
    { value: 'UNSTAKE', label: t`Unstake` },
    { value: 'CLAIM', label: t`Claim Rewards` },
  ]

  const [selectedTab, setSelectedTab] = useState<FormType>('WITHDRAW')

  const handleTabChange = useCallback(
    (tab: FormType) => {
      setStateByKey('formType', tab)
      setSelectedTab(tab)
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
    <>
      <TabsSwitcher
        variant="underlined"
        size="small"
        value={selectedTab}
        onChange={handleTabChange}
        options={TABS}
        sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, '& .MuiTab-root': { flexGrow: 1 } }}
      />

      <AppFormContentWrapper>
        {formType === 'WITHDRAW' && <FormWithdraw {...transferProps} />}
        {formType === 'UNSTAKE' && <FormUnstake {...transferProps} />}
        {formType === 'CLAIM' && <FormClaim {...transferProps} />}
      </AppFormContentWrapper>
    </>
  )
}

export default Withdraw
