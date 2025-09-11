import { useCallback, useEffect, useState } from 'react'
import type { TransferProps } from '@/dex/components/PagePool/types'
import FormClaim from '@/dex/components/PagePool/Withdraw/components/FormClaim'
import FormUnstake from '@/dex/components/PagePool/Withdraw/components/FormUnstake'
import FormWithdraw from '@/dex/components/PagePool/Withdraw/components/FormWithdraw'
import type { FormType } from '@/dex/components/PagePool/Withdraw/types'
import useStore from '@/dex/store/useStore'
import Stack from '@mui/material/Stack'
import { AppFormContentWrapper } from '@ui/AppForm'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher, type TabOption } from '@ui-kit/shared/ui/TabsSwitcher'

const tabs: TabOption<FormType>[] = [
  { value: 'WITHDRAW', label: t`Withdraw` },
  { value: 'UNSTAKE', label: t`Unstake` },
  { value: 'CLAIM', label: t`Claim Rewards` },
]

const Withdraw = (transferProps: TransferProps) => {
  const { poolData } = transferProps

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
    <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
      <TabsSwitcher variant="underlined" size="small" value={tab} onChange={handleTabChange} options={tabs} fullWidth />

      <AppFormContentWrapper>
        {formType === 'WITHDRAW' && <FormWithdraw {...transferProps} />}
        {formType === 'UNSTAKE' && <FormUnstake {...transferProps} />}
        {formType === 'CLAIM' && <FormClaim {...transferProps} />}
      </AppFormContentWrapper>
    </Stack>
  )
}

export default Withdraw
