import type { BaseConfig } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { type FormTab, FormTabs } from '@ui-kit/widgets/DetailPageLayout/FormTabs'
import { BridgeForm } from './components/BridgeForm'

export type BridgeFormParams = {
  chainId: number
  networks: Record<number, BaseConfig>
}

const BridgeMenu = [
  {
    value: 'bridge',
    label: t`Bridge crvUSD`,
    component: (params: BridgeFormParams) => <BridgeForm {...params} />,
  },
] satisfies FormTab<BridgeFormParams>[]

export const BridgeFormTabs = ({ ...params }: BridgeFormParams) => <FormTabs params={params} menu={BridgeMenu} />
