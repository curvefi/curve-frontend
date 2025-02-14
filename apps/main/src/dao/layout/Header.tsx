import React, { useCallback, useMemo, useRef } from 'react'
import { t } from '@ui-kit/lib/i18n'
import { useLocation, useNavigate } from 'react-router-dom'
import { CONNECT_STAGE } from '@/dao/constants'
import { getNetworkFromUrl, getRestFullPathname } from '@/dao/utils/utilsRouter'
import { _parseRouteAndIsActive, isLoading } from '@ui/utils'
import { getWalletSignerAddress, useWallet } from '@ui-kit/features/connect-wallet'
import networks, { visibleNetworksList } from '@/dao/networks'
import useLayoutHeight from '@/dao/hooks/useLayoutHeight'
import useStore from '@/dao/store/useStore'
import { Header as NewHeader, useHeaderHeight } from '@ui-kit/widgets/Header'
import { NavigationSection } from '@ui-kit/widgets/Header/types'
import { APP_LINK } from '@ui-kit/shared/routes'
import { GlobalBannerProps } from '@ui/Banner/GlobalBanner'
import { ChainId } from '@/dao/types/dao.types'

type HeaderProps = { sections: NavigationSection[]; BannerProps: GlobalBannerProps }

export const Header = ({ sections, BannerProps }: HeaderProps) => {
  const { wallet } = useWallet()
  const mainNavRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  useLayoutHeight(mainNavRef, 'mainNav')

  const { rChainId, rNetwork } = getNetworkFromUrl()

  const connectState = useStore((state) => state.connectState)
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const bannerHeight = useStore((state) => state.layoutHeight.globalAlert)
  const routerProps = useStore((state) => state.routerProps)
  const updateConnectState = useStore((state) => state.updateConnectState)

  const location = useLocation()
  const { params: routerParams } = routerProps ?? {}
  const routerNetwork = routerParams?.network ?? 'ethereum'
  const routerPathname = location?.pathname ?? ''

  return (
    <NewHeader<ChainId>
      networkName={rNetwork}
      mainNavRef={mainNavRef}
      isMdUp={isMdUp}
      currentApp="dao"
      pages={useMemo(
        () => _parseRouteAndIsActive(APP_LINK.dao.pages, routerPathname, routerNetwork),
        [routerNetwork, routerPathname],
      )}
      ChainProps={{
        options: visibleNetworksList,
        disabled: isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK),
        chainId: rChainId,
        onChange: useCallback(
          (selectedChainId: ChainId) => {
            if (rChainId !== selectedChainId) {
              const network = networks[selectedChainId as ChainId].id
              navigate(`${network}/${getRestFullPathname()}`)
              updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [rChainId, selectedChainId])
            }
          },
          [rChainId, navigate, updateConnectState],
        ),
      }}
      WalletProps={{
        onConnectWallet: useCallback(
          () => updateConnectState('loading', CONNECT_STAGE.CONNECT_WALLET, ['']),
          [updateConnectState],
        ),
        onDisconnectWallet: useCallback(
          () => updateConnectState('loading', CONNECT_STAGE.DISCONNECT_WALLET),
          [updateConnectState],
        ),
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

export default Header
