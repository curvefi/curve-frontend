import { useRouter } from 'next/navigation'
import { type RefObject, useCallback, useRef } from 'react'
import { useTvl } from '@/lend/entities/chain'
import networks, { visibleNetworksList } from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import { ChainId, type LlamalendApi, type NetworkEnum } from '@/lend/types/lend.types'
import { getPath, getRestFullPathname } from '@/lend/utils/utilsRouter'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import {
  CONNECT_STAGE,
  getWalletSignerAddress,
  isLoading,
  useConnection,
  useWallet,
} from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { APP_LINK } from '@ui-kit/shared/routes'
import { Header as NewHeader, useHeaderHeight } from '@ui-kit/widgets/Header'
import type { NavigationSection } from '@ui-kit/widgets/Header/types'

export const Header = ({
  chainId,
  sections,
  globalAlertRef,
  networkId,
}: {
  chainId: ChainId
  sections: NavigationSection[]
  globalAlertRef: RefObject<HTMLDivElement | null>
  networkId: NetworkEnum
}) => {
  const { wallet } = useWallet()
  const { push } = useRouter()
  const mainNavRef = useRef<HTMLDivElement>(null)
  const bannerHeight = useStore((state) => state.layout.height.globalAlert)
  const { connectState } = useConnection<LlamalendApi>()
  const { data: tvl } = useTvl(chainId)

  return (
    <NewHeader<ChainId>
      networkId={networkId}
      mainNavRef={mainNavRef}
      currentMenu="lend"
      routes={APP_LINK.lend.routes}
      ChainProps={{
        options: visibleNetworksList,
        disabled: isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK),
        chainId,
        onChange: useCallback(
          (selectedChainId: ChainId) => {
            if (chainId !== selectedChainId) {
              push(getPath({ network: networks[selectedChainId].id }, `/${getRestFullPathname()}`))
            }
          },
          [chainId, push],
        ),
      }}
      WalletProps={{
        walletAddress: getWalletSignerAddress(wallet),
        disabled: isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK),
        label: t`Connect Wallet`,
      }}
      appStats={[
        {
          label: 'TVL',
          value: (tvl && formatNumber(tvl, { ...FORMAT_OPTIONS.USD, notation: 'compact' })) || '',
        },
      ]}
      height={useHeaderHeight(bannerHeight)}
      globalAlertRef={globalAlertRef}
      sections={sections}
    />
  )
}
