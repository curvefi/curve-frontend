import { useCallback, useEffect } from 'react'
import { FormDeposit } from '@/dex/components/PagePool/Deposit/components/FormDeposit'
import { FormDepositStake } from '@/dex/components/PagePool/Deposit/components/FormDepositStake'
import { FormStake } from '@/dex/components/PagePool/Deposit/components/FormStake'
import type { FormType } from '@/dex/components/PagePool/Deposit/types'
import { DEFAULT_FORM_STATUS } from '@/dex/components/PagePool/Deposit/utils'
import type { TransferProps } from '@/dex/components/PagePool/types'
import { useStore } from '@/dex/store/useStore'
import { type TabItem, useTabs } from '@evm-ui/hooks/useTabs'
import { t } from '@evm-ui/lib/i18n'
import { TabsSwitcher } from '@evm-ui/shared/ui/Tabs/TabsSwitcher'
import { FormContent } from '@evm-ui/widgets/DetailPageLayout/FormContent'
import { AlertBox } from '@legacy-ui/AlertBox'

type DepositTabsParams = TransferProps & { hasDepositAndStake: boolean }

const DepositTab = ({ hasDepositAndStake, ...transferProps }: DepositTabsParams) => (
  <FormDeposit hasDepositAndStake={hasDepositAndStake} {...transferProps} />
)

const DepositStakeTab = ({ hasDepositAndStake, ...transferProps }: DepositTabsParams) =>
  transferProps.poolDataCacheOrApi.gauge.isKilled ? (
    <AlertBox alertType="warning">{t`Staking is disabled due to inactive Gauge.`}</AlertBox>
  ) : (
    <FormDepositStake hasDepositAndStake={hasDepositAndStake} {...transferProps} />
  )

const StakeTab = ({ hasDepositAndStake, ...transferProps }: DepositTabsParams) =>
  transferProps.poolDataCacheOrApi.gauge.isKilled ? (
    <AlertBox alertType="warning">{t`Staking is disabled due to inactive Gauge.`}</AlertBox>
  ) : (
    <FormStake hasDepositAndStake={hasDepositAndStake} {...transferProps} />
  )

const menu: TabItem<FormType, DepositTabsParams>[] = [
  { value: 'DEPOSIT', label: t`Deposit`, component: DepositTab },
  { value: 'STAKE', label: t`Stake`, component: StakeTab },
  { value: 'DEPOSIT_STAKE', label: t`Deposit & Stake`, component: DepositStakeTab },
]

export const Deposit = ({ hasDepositAndStake, ...transferProps }: TransferProps & { hasDepositAndStake: boolean }) => {
  const { poolAlert, poolData } = transferProps
  const formType = useStore(state => state.poolDeposit.formType)
  const resetState = useStore(state => state.poolDeposit.resetState)
  const setStateByKeys = useStore(state => state.poolDeposit.setStateByKeys)

  const handleTabChange = useCallback(
    (tab: FormType) => {
      setStateByKeys({ formStatus: DEFAULT_FORM_STATUS, formType: tab })
    },
    [setStateByKeys],
  )

  useEffect(() => {
    if (poolData) {
      handleTabChange('DEPOSIT')
      resetState(poolData, 'DEPOSIT')
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [poolData?.pool?.id])

  const {
    content,
    onChange,
    tab: { value },
    tabs,
  } = useTabs({
    menu,
    params: { hasDepositAndStake, ...transferProps },
    value: formType,
    onChange: handleTabChange,
  })

  return (
    <FormContent
      header={
        <TabsSwitcher variant="underlined" value={value} onChange={onChange} options={tabs} overflow="fullWidth" />
      }
    >
      {poolAlert?.isDisableDeposit ? <AlertBox {...poolAlert}>{poolAlert.message}</AlertBox> : content}
    </FormContent>
  )
}
