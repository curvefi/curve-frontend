import React, { FunctionComponent, useCallback, useMemo } from 'react'
import { t } from '@lingui/macro'
import { useNavigate } from 'react-router-dom'

import { CONNECT_STAGE, ROUTE } from '@/constants'
import { DEFAULT_LOCALES, updateAppLocale } from '@/lib/i18n'
import { getNetworkFromUrl, getParamsFromUrl, getRestFullPathname, getRestPartialPathname } from '@/utils/utilsRouter'
import { _parseRouteAndIsActive, FORMAT_OPTIONS, formatNumber, isLoading } from '@/ui/utils'
import { getWalletSignerAddress, useConnectWallet } from '@/common/features/connect-wallet'
import networks, { visibleNetworksList } from '@/networks'
import useStore from '@/store/useStore'
import { useTvl } from '@/entities/chain'
import { Header as NewHeader } from '@/common/widgets/Header'
import { NavigationSection } from '@/common/widgets/Header/types'
import { Locale } from '@/ui/AppNav/types'
import useMediaQuery from '@mui/material/useMediaQuery'
import { type Theme } from '@mui/system'
import { ThemeKey } from '@ui-kit/themes/basic-theme'


type HeaderProps = { chainId: ChainId, sections: NavigationSection[] }

const isMdUpQuery = (theme: Theme) => theme.breakpoints.up('tablet');

const Header: FunctionComponent<HeaderProps> = ({ chainId, sections }) => {
  const [{ wallet }] = useConnectWallet()
  const navigate = useNavigate()

  const { rLocalePathname } = getParamsFromUrl()

  const connectState = useStore((state) => state.connectState)
  const isAdvancedMode = useStore((state) => state.isAdvanceMode)
  const locale = useStore((state) => state.locale)
  const updateGlobalStoreByKey = useStore((state) => state.updateGlobalStoreByKey)
  const routerProps = useStore((state) => state.routerProps)
  const themeType = useStore((state) => state.themeType)
  const setAppCache = useStore((state) => state.setAppCache)
  const updateConnectState = useStore((state) => state.updateConnectState)
  const isMdUp = useMediaQuery(isMdUpQuery, { noSsr: true })
  const { data: tvl } = useTvl(chainId);

  const { params: routerParams, location } = routerProps ?? {}
  const routerPathname = location?.pathname ?? ''
  const routerNetwork = routerParams?.network

  return (
    <NewHeader
      locale={locale}
      isMdUp={isMdUp}
      advancedMode={[
        isAdvancedMode,
        useCallback((isAdvanced) => setAppCache('isAdvanceMode', isAdvanced), [setAppCache]),
      ]}
      currentApp="lend"
      pages={useMemo(() =>
        _parseRouteAndIsActive([
          { route: ROUTE.PAGE_MARKETS, label: t`Markets`, groupedTitle: isMdUp ? 'Markets' : 'Llamalend' },
          {
            route: ROUTE.PAGE_INTEGRATIONS,
            label: t`Integrations`,
            groupedTitle: isMdUp ? 'Others' : 'Llamalend', ...!isMdUp && { minWidth: '10rem' }
          },
          { route: ROUTE.PAGE_RISK_DISCLAIMER, label: t`Risk Disclaimer`, groupedTitle: isMdUp ? 'risk' : 'Llamalend' }
        ], rLocalePathname, routerPathname, routerNetwork), [isMdUp, rLocalePathname, routerNetwork, routerPathname])}
      themes={[
        themeType,
        useCallback((selectedThemeType: ThemeKey) => setAppCache('themeType', selectedThemeType), [setAppCache]),
      ]}
      LanguageProps={{
        locale,
        locales: DEFAULT_LOCALES,
        onChange: useCallback((selectedLocale: React.Key) => {
          const { rNetwork } = getNetworkFromUrl()
          updateAppLocale(selectedLocale as Locale, updateGlobalStoreByKey)
          navigate(`${selectedLocale === 'en' ? '' : `/${selectedLocale}`}/${rNetwork}/${getRestFullPathname()}`)
        }, [updateGlobalStoreByKey, navigate]),
      }}
      ChainProps={{
        options: visibleNetworksList,
        disabled: isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK),
        chainId: chainId,
        onChange: useCallback((selectedChainId: ChainId) => {
          if (chainId !== selectedChainId) {
            const network = networks[selectedChainId as ChainId].id
            const [currPath] = window.location.hash.split('?')

            if (currPath.endsWith('markets')) {
              // include search params when in market list page
              navigate(`${rLocalePathname}/${network}/${getRestFullPathname()}`)
            } else {
              navigate(`${rLocalePathname}/${network}/${getRestPartialPathname()}`)
            }

            updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [chainId, selectedChainId])
          }
        }, [chainId, rLocalePathname, updateConnectState, navigate]),
      }}
      WalletProps={{
        onConnectWallet: useCallback(() => updateConnectState('loading', CONNECT_STAGE.CONNECT_WALLET, ['']), [updateConnectState]),
        onDisconnectWallet: useCallback(() => updateConnectState('loading', CONNECT_STAGE.DISCONNECT_WALLET), [updateConnectState]),
        walletAddress: getWalletSignerAddress(wallet),
        disabled: isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK),
        label: t`Connect Wallet`,
      }}
      appStats={[{ label: 'TVL', value: tvl && formatNumber(tvl, { ...FORMAT_OPTIONS.USD, showDecimalIfSmallNumberOnly: true }) || '' }]}
      sections={sections}
      translations={{
        advanced: t`Advanced`,
        advancedMode: t`Advanced Mode`,
        theme: t`Mode`,
        language: t`Language`,
        otherApps: t`Other Apps`,
        settings: t`Settings`,
        socialMedia: t`Community`,
      }}
    />
  )
}

export default Header
