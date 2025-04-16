import { useRouter } from 'next/navigation'
import { useCallback, useRef } from 'react'
import { CONNECT_STAGE } from '@/dao/constants'
import useLayoutHeight from '@/dao/hooks/useLayoutHeight'
import networks, { visibleNetworksList } from '@/dao/networks'
import useStore from '@/dao/store/useStore'
import { ChainId, type CurveApi } from '@/dao/types/dao.types'
import { getNetworkFromUrl, getPath, getRestFullPathname } from '@/dao/utils/utilsRouter'
import { isLoading, useConnection } from '@ui-kit/features/connect-wallet'
import { APP_LINK } from '@ui-kit/shared/routes'
import { GlobalBannerProps } from '@ui-kit/shared/ui/GlobalBanner'
import { Header as NewHeader, useHeaderHeight } from '@ui-kit/widgets/Header'
import { NavigationSection } from '@ui-kit/widgets/Header/types'

type HeaderProps = { sections: NavigationSection[]; BannerProps: GlobalBannerProps }

export const Header = ({ sections, BannerProps }: HeaderProps) => {
  const mainNavRef = useRef<HTMLDivElement>(null)
  const { push } = useRouter()
  useLayoutHeight(mainNavRef, 'mainNav')

  const { rChainId, rNetwork } = getNetworkFromUrl()

  const { connectState } = useConnection<CurveApi>()
  const bannerHeight = useStore((state) => state.layoutHeight.globalAlert)
  return (
    <NewHeader<ChainId>
      networkName={rNetwork}
      mainNavRef={mainNavRef}
      currentMenu="dao"
      routes={APP_LINK.dao.routes}
      ChainProps={{
        options: visibleNetworksList,
        disabled: isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK),
        chainId: rChainId,
        onChange: useCallback(
          (selectedChainId: ChainId) => {
            if (rChainId !== selectedChainId) {
              const network = networks[selectedChainId as ChainId].id
              push(getPath({ network }, `/${getRestFullPathname()}`))
            }
          },
          [rChainId, push],
        ),
      }}
      BannerProps={BannerProps}
      height={useHeaderHeight(bannerHeight)}
      sections={sections}
    />
  )
}

export default Header
