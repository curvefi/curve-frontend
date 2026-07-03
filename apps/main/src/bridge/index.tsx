// eslint-disable-next-line import-x/no-restricted-paths
import { useNetworks } from '@/dex/entities/networks'
// eslint-disable-next-line import-x/no-restricted-paths
import { useChainId } from '@/dex/hooks/useChainId'
import type { INetworkName } from '@curvefi/api/lib/interfaces'
import { useParams } from '@ui-kit/hooks/router'
import { LegacyDetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/LegacyDetailPageLayout'
import { BridgeFormTabs } from './features/bridge/BridgeFormTabs'
import { Bridges } from './features/bridges'

export const PageBridge = () => {
  const { network } = useParams<{ network: INetworkName }>()

  // TODO: useChainId and useNetworks are a dex imports, need to refactor later.
  const chainId = useChainId(network)
  const { data: networks } = useNetworks()

  return (
    <LegacyDetailPageLayout formTabs={<BridgeFormTabs chainId={chainId} networks={networks} />}>
      <Bridges />
    </LegacyDetailPageLayout>
  )
}
