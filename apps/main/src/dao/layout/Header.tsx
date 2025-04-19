import { useRouter } from 'next/navigation'
import { useCallback, useRef } from 'react'
import { CONNECT_STAGE } from '@/dao/constants'
import useLayoutHeight from '@/dao/hooks/useLayoutHeight'
import networks, { visibleNetworksList } from '@/dao/networks'
import useStore from '@/dao/store/useStore'
import { ChainId, type CurveApi } from '@/dao/types/dao.types'
import { getPath, getRestFullPathname } from '@/dao/utils/utilsRouter'
import { getWalletSignerAddress, isLoading, useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { APP_LINK } from '@ui-kit/shared/routes'
import { GlobalBannerProps } from '@ui-kit/shared/ui/GlobalBanner'
import { Header as NewHeader, useHeaderHeight } from '@ui-kit/widgets/Header'
import { NavigationSection } from '@ui-kit/widgets/Header/types'

export const Header = ({
  sections,
  chainId,
  BannerProps,
}: {
  sections: NavigationSection[]
  BannerProps: GlobalBannerProps
  chainId: ChainId
}) => {
  const { wallet } = useWallet()
  const mainNavRef = useRef<HTMLDivElement>(null)
  const { push } = useRouter()
  const { networkName } = BannerProps
  useLayoutHeight(mainNavRef, 'mainNav')
  const { connectState } = useConnection<CurveApi>()
  const bannerHeight = useStore((state) => state.layoutHeight.globalAlert)
  return (
    <NewHeader<ChainId>
      networkName={networkName}
      mainNavRef={mainNavRef}
      currentMenu="dao"
      routes={APP_LINK.dao.routes}
      ChainProps={{
        options: visibleNetworksList,
        disabled: isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK),
        chainId,
        onChange: useCallback(
          (selectedChainId: ChainId) => {
            if (chainId !== selectedChainId) {
              const network = networks[selectedChainId as ChainId].id
              push(getPath({ network }, `/${getRestFullPathname()}`))
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
      BannerProps={BannerProps}
      height={useHeaderHeight(bannerHeight)}
      sections={sections}
    />
  )
}
