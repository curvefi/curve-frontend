import type { BaseConfig } from '@legacy-ui/utils'
import { t } from '@evm-ui/lib/i18n'
import { type FormTab, FormTabs } from '@evm-ui/widgets/DetailPageLayout/FormTabs'
import { BridgeForm } from './components/BridgeForm'
import { useBridgeAlert } from './hooks/useBridgeAlert'

export type BridgeFormParams = {
  chainId: number
  networks: Record<number, BaseConfig>
}

const BridgeTab = (params: BridgeFormParams) => {
  const bridgeAlert = useBridgeAlert(params.chainId)
  const bridgeDisabledAlert = bridgeAlert?.isBridgeDisabled
    ? { message: bridgeAlert.message, alertType: bridgeAlert.alertType }
    : undefined

  return <BridgeForm {...params} bridgeDisabledAlert={bridgeDisabledAlert} />
}

const BridgeMenu = [
  {
    value: 'bridge',
    label: t`Bridge crvUSD`,
    component: BridgeTab,
  },
] satisfies FormTab<BridgeFormParams>[]

export const BridgeFormTabs = ({ ...params }: BridgeFormParams) => <FormTabs params={params} menu={BridgeMenu} />
