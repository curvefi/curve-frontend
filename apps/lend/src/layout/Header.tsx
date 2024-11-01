import type { AppPage } from '@/ui/AppNav/types'

import React, { useCallback, useEffect, useMemo, useRef } from 'react'
import { t } from '@lingui/macro'
import { useNavigate } from 'react-router-dom'

import { CONNECT_STAGE, ROUTE } from '@/constants'
import { DEFAULT_LOCALES } from '@/lib/i18n'
import { getNetworkFromUrl, getParamsFromUrl, getRestFullPathname, getRestPartialPathname } from '@/utils/utilsRouter'
import { _parseRouteAndIsActive, FORMAT_OPTIONS, formatNumber, isLoading } from '@/ui/utils'
import { getWalletSignerAddress, useConnectWallet } from '@/common/features/connect-wallet'
import { useHeightResizeObserver } from '@/ui/hooks'
import networks, { visibleNetworksList } from '@/networks'
import useStore from '@/store/useStore'
import { useTvl } from '@/entities/chain'
import { Header as NewHeader } from '@/common/widgets/Header'
import { ThemeKey } from '@ui-kit/shared/lib'


const getSections = (rChainId: ChainId) => [
  {
    title: t`Documentation`,
    links: [
      { route: 'https://news.curve.fi/', label: t`News` },
      { route: 'https://resources.curve.fi/lending/understanding-lending/', label: t`User Resources` },
      { route: 'https://docs.curve.fi', label: t`Developer Resources` },
      { route: 'https://docs.curve.fi/integration/overview/', label: t`Integrations` },
      { route: 'https://resources.curve.fi/glossary-branding/branding/', label: t`Branding` }
    ]
  },
  {
    title: t`Security`, // audits, bug bounty, dune analytics, curve monitor & crvhub
    links: [
      { route: 'https://docs.curve.fi/references/audits/', label: t`Audits` },
      { route: `${networks[rChainId ?? '1']?.orgUIPath}/bugbounty`, label: t`Bug Bounty` },
      { route: 'https://dune.com/mrblock_buidl/Curve.fi', label: t`Dune Analytics` },
      { route: 'https://curvemonitor.com', label: t`Curve Monitor` },
      { route: 'https://crvhub.com/', label: t`Crvhub` }
    ]
  }
]

const Header = () => {
  const [{ wallet }] = useConnectWallet()
  const mainNavRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const elHeight = useHeightResizeObserver(mainNavRef)

  const { rChainId, rLocalePathname } = getParamsFromUrl()

  const connectState = useStore((state) => state.connectState)
  const isAdvancedMode = useStore((state) => state.isAdvanceMode)
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const locale = useStore((state) => state.locale)
  const routerProps = useStore((state) => state.routerProps)
  const themeType = useStore((state) => state.themeType)
  const setLayoutHeight = useStore((state) => state.layout.setLayoutHeight)
  const setAppCache = useStore((state) => state.setAppCache)
  const updateConnectState = useStore((state) => state.updateConnectState)
  const { data: tvl } = useTvl(rChainId);

  const { params: routerParams, location } = routerProps ?? {}
  const routerPathname = location?.pathname ?? ''
  const routerNetwork = routerParams?.network

  useEffect(() => {
    setLayoutHeight('mainNav', elHeight)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elHeight])

  return (
    <NewHeader
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
      languages={{
        locale,
        locales: DEFAULT_LOCALES,
        onChange: useCallback((selectedLocale: React.Key) => {
          const locale = selectedLocale === 'en' ? '' : `/${selectedLocale}`
          const { rNetwork } = getNetworkFromUrl()
          navigate(`${locale}/${rNetwork}/${getRestFullPathname()}`)
        }, [navigate]),
      }}
      chains={{
        options: visibleNetworksList,
        disabled: isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK),
        chainId: rChainId,
        onChange: useCallback((selectedChainId: ChainId) => {
          if (rChainId !== selectedChainId) {
            const network = networks[selectedChainId as ChainId].id
            const [currPath] = window.location.hash.split('?')

            if (currPath.endsWith('markets')) {
              // include search params when in market list page
              navigate(`${rLocalePathname}/${network}/${getRestFullPathname()}`)
            } else {
              navigate(`${rLocalePathname}/${network}/${getRestPartialPathname()}`)
            }

            updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [rChainId, selectedChainId])
          }
        }, [rChainId, rLocalePathname, updateConnectState, navigate]),
      }}
      wallet={{
        onConnectWallet: useCallback(() => updateConnectState('loading', CONNECT_STAGE.CONNECT_WALLET, ['']), [updateConnectState]),
        onDisconnectWallet: useCallback(() => updateConnectState('loading', CONNECT_STAGE.DISCONNECT_WALLET), [updateConnectState]),
        walletAddress: getWalletSignerAddress(wallet),
        disabled: isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK),
        label: t`Connect Wallet`,
      }}
      appStats={[{ label: 'TVL', value: tvl && formatNumber(tvl, { ...FORMAT_OPTIONS.USD, showDecimalIfSmallNumberOnly: true }) || '' }]}
      sections={useMemo(() => getSections(rChainId), [rChainId])}
      translations={{
        advancedMode: t`Advanced`,
        themeSwitcher: t`Mode`,
        otherApps: t`Other Apps`,
        options: t`Options`,
        socialMedia: t`Community`,
      }}
    />
  )
}

export default Header
