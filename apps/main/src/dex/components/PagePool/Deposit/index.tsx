import { useCallback, useEffect, useState } from 'react'
import FormDeposit from '@/dex/components/PagePool/Deposit/components/FormDeposit'
import FormDepositStake from '@/dex/components/PagePool/Deposit/components/FormDepositStake'
import FormStake from '@/dex/components/PagePool/Deposit/components/FormStake'
import type { FormType } from '@/dex/components/PagePool/Deposit/types'
import { DEFAULT_FORM_STATUS } from '@/dex/components/PagePool/Deposit/utils'
import type { TransferProps } from '@/dex/components/PagePool/types'
import useStore from '@/dex/store/useStore'
import AlertBox from '@ui/AlertBox'
import { t } from '@ui-kit/lib/i18n'
import { TabsSwitcher } from '@ui-kit/shared/ui/TabsSwitcher'

const Deposit = ({ hasDepositAndStake, ...transferProps }: TransferProps & { hasDepositAndStake: boolean }) => {
  const { poolAlert, poolData, poolDataCacheOrApi } = transferProps
  const formType = useStore((state) => state.poolDeposit.formType)
  const resetState = useStore((state) => state.poolDeposit.resetState)
  const setStateByKeys = useStore((state) => state.poolDeposit.setStateByKeys)

  const TABS: { value: FormType; label: string }[] = [
    { value: 'DEPOSIT', label: t`Deposit` },
    { value: 'STAKE', label: t`Stake` },
    { value: 'DEPOSIT_STAKE', label: t`Deposit & Stake` },
  ]

  const [selectedTab, setSelectedTab] = useState<FormType>('DEPOSIT')

  const handleTabChange = useCallback(
    (tab: FormType) => {
      setStateByKeys({
        formStatus: DEFAULT_FORM_STATUS,
        formType: tab,
      })
      setSelectedTab(tab)
    },
    [setStateByKeys],
  )

  useEffect(() => {
    if (poolData) {
      handleTabChange('DEPOSIT')
      resetState(poolData, 'DEPOSIT')
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
        sx={{
          backgroundColor: (t) => t.design.Layer[1].Fill,
          // Undo the padding from AppFormContentWrapper, not the cleanest but will have to do for now.
          marginInline: 'calc(-1 * var(--spacing-3))',
          marginTop: '-0.5rem',
        }}
      />

      {poolAlert && poolAlert.isDisableDeposit ? (
        <AlertBox {...poolAlert}>{poolAlert.message}</AlertBox>
      ) : (
        <>
          {formType === 'DEPOSIT' && <FormDeposit hasDepositAndStake={hasDepositAndStake} {...transferProps} />}
          {formType === 'DEPOSIT_STAKE' && (
            <>
              {poolDataCacheOrApi.gauge.isKilled ? (
                <AlertBox alertType="warning">{t`Staking is disabled due to inactive Gauge.`}</AlertBox>
              ) : (
                <FormDepositStake hasDepositAndStake={hasDepositAndStake} {...transferProps} />
              )}
            </>
          )}
          {formType === 'STAKE' && (
            <>
              {poolDataCacheOrApi.gauge.isKilled ? (
                <AlertBox alertType="warning">{t`Staking is disabled due to inactive Gauge.`}</AlertBox>
              ) : (
                <FormStake hasDepositAndStake={hasDepositAndStake} {...transferProps} />
              )}
            </>
          )}
        </>
      )}
    </>
  )
}

export default Deposit
