import React, { useCallback, useMemo, useRef } from 'react'
import { t } from '@lingui/macro'
import { useNavigate } from 'react-router-dom'
import { CONNECT_STAGE, ROUTE } from '@/constants'
import { getLocaleFromUrl, getNetworkFromUrl, getRestFullPathname } from '@/utils/utilsRouter'
import { _parseRouteAndIsActive, isLoading } from '@/ui/utils'
import { getWalletSignerAddress, useConnectWallet } from '@/common/features/connect-wallet'
import networks, { visibleNetworksList } from '@/networks'
import useLayoutHeight from '@/hooks/useLayoutHeight'
import useStore from '@/store/useStore'
import { Header as NewHeader } from '@/common/widgets/Header'
import { NavigationSection } from '@/common/widgets/Header/types'
import { ThemeKey } from 'curve-ui-kit/src/themes/basic-theme'

type HeaderProps = { sections: NavigationSection[] }

export const Header = ({ sections }: HeaderProps) => {
  const [{ wallet }] = useConnectWallet()
  const mainNavRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  useLayoutHeight(mainNavRef, 'mainNav')

  const { rChainId } = getNetworkFromUrl()

  const connectState = useStore((state) => state.connectState)
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const locale = useStore((state) => state.locale)
  const routerProps = useStore((state) => state.routerProps)
  const themeType = useStore((state) => state.themeType)
  const setAppCache = useStore((state) => state.setAppCache)
  const updateConnectState = useStore((state) => state.updateConnectState)

  const rLocale = getLocaleFromUrl()
  const { params: routerParams, location } = routerProps ?? {}

  const routerNetwork = routerParams?.network ?? 'ethereum'
  const routerPathname = location?.pathname ?? ''

  const theme = themeType == 'default' ? 'light' : (themeType as ThemeKey)
  return (
    <NewHeader<ChainId>
      mainNavRef={mainNavRef}
      locale={locale}
      isMdUp={isMdUp}
      currentApp="dao"
      pages={useMemo(
        () =>
          _parseRouteAndIsActive(
            [
              { route: ROUTE.PAGE_VECRV_CREATE, label: t`Lock CRV`, groupedTitle: 'DAO' },
              { route: ROUTE.PAGE_PROPOSALS, label: t`Proposals`, groupedTitle: 'DAO' },
              { route: ROUTE.PAGE_GAUGES, label: t`Gauges`, groupedTitle: 'DAO' },
              { route: ROUTE.PAGE_ANALYTICS, label: t`Analytics`, groupedTitle: 'DAO' },
            ],
            rLocale.rLocalePathname,
            routerPathname,
            routerNetwork,
          ),
        [rLocale.rLocalePathname, routerNetwork, routerPathname],
      )}
      themes={[
        theme,
        useCallback(
          (selectedThemeType: ThemeKey) =>
            setAppCache('themeType', selectedThemeType == 'light' ? 'default' : selectedThemeType),
          [setAppCache],
        ),
      ]}
      ChainProps={{
        theme,
        options: visibleNetworksList,
        disabled: isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK),
        chainId: rChainId,
        onChange: useCallback(
          (selectedChainId: ChainId) => {
            if (rChainId !== selectedChainId) {
              const network = networks[selectedChainId as ChainId].id
              navigate(`${locale}/${network}/${getRestFullPathname()}`)
              updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [rChainId, selectedChainId])
            }
          },
          [rChainId, navigate, locale, updateConnectState],
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
      appStats={[]}
      sections={sections}
      translations={{
        advanced: t`Advanced Mode`,
        advancedMode: t`Advanced`,
        theme: t`Mode`,
        otherApps: t`Other Apps`,
        settings: t`Settings`,
        socialMedia: t`Community`,
      }}
    />
  )
}

export default Header
