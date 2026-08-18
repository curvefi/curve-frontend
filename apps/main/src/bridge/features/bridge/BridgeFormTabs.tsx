import type { BaseConfig } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { type FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'
import { BridgeForm } from './components/BridgeForm'
import { LayerZeroBridgeForm } from './components/LayerZeroBridgeForm'
import { useBridgeAlert } from './hooks/useBridgeAlert'
import { isLayerZeroChain } from './layerzero'

export type BridgeFormParams = {
  chainId: number
  networks: Record<number, BaseConfig>
}

const BridgeTab = (params: BridgeFormParams) => {
  const bridgeAlert = useBridgeAlert(params.chainId)
  const bridgeDisabledAlert = bridgeAlert?.isBridgeDisabled
    ? { message: bridgeAlert.message, alertType: bridgeAlert.alertType }
    : undefined

  return isLayerZeroChain(params.chainId) ? (
    <LayerZeroBridgeForm {...params} />
  ) : (
    <BridgeForm {...params} bridgeDisabledAlert={bridgeDisabledAlert} />
  )
}

const BridgeMenu = [
  {
    value: 'bridge',
    label: t`Bridge tokens`,
    component: BridgeTab,
  },
] satisfies FormTab<BridgeFormParams>[]

export const BridgeFormTabs = ({ ...params }: BridgeFormParams) => <FormTabs params={params} menu={BridgeMenu} />
