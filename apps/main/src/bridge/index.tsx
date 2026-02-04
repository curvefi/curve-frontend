import { useNetworks } from '@/dex/entities/networks'
import { useChainId } from '@/dex/hooks/useChainId'
import type { INetworkName } from '@curvefi/api/lib/interfaces'
import { useParams } from '@ui-kit/hooks/router'
import { useFastbridge } from '@ui-kit/hooks/useFeatureFlags'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'
import { BridgeFormTabs } from './features/bridge/BridgeFormTabs'
import { Bridges } from './features/bridges'

export const PageBridge = () => {
  const { network } = useParams<{ network: INetworkName }>()

  // TODO: useChainId and useNetworks are a dex imports, need to refactor later.
  const chainId = useChainId(network)
  const { data: networks } = useNetworks()

  return (
    <DetailPageLayout
      formTabs={useFastbridge() ? <BridgeFormTabs chainId={chainId} networks={networks} /> : null}
      footer={<Bridges />}
    >
      {/** Tables would go here, but that's for another ticket */}
    </DetailPageLayout>
  )
}
