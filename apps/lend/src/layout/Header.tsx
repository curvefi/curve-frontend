import { useCallback, useEffect, useMemo, useRef } from 'react'
import { t } from '@lingui/macro'
import { useNavigate } from 'react-router-dom'
import { CONNECT_STAGE } from '@/constants'
import { getParamsFromUrl, getRestFullPathname, getRestPartialPathname } from '@/utils/utilsRouter'
import { _parseRouteAndIsActive, FORMAT_OPTIONS, formatNumber, isLoading } from '@/ui/utils'
import { getWalletSignerAddress, useConnectWallet } from '@/common/features/connect-wallet'
import networks, { visibleNetworksList } from '@/networks'
import useStore from '@/store/useStore'
import { useTvl } from '@/entities/chain'
import { Header as NewHeader, useHeaderHeight } from '@/common/widgets/Header'
import useMediaQuery from '@mui/material/useMediaQuery'
import { type Theme } from '@mui/system'
import type { ThemeKey } from '@ui-kit/themes/basic-theme'
import type { NavigationSection } from '@/common/widgets/Header/types'
import { useHeightResizeObserver } from '@/ui/hooks'
import { APP_LINK } from '@ui-kit/shared/routes'
import { GlobalBannerProps } from '@/ui/Banner/GlobalBanner'

type HeaderProps = { chainId: ChainId; sections: NavigationSection[]; BannerProps: GlobalBannerProps }

const isMdUpQuery = (theme: Theme) => theme.breakpoints.up('tablet')

const Header = ({ chainId, sections, BannerProps }: HeaderProps) => {
  const [{ wallet }] = useConnectWallet()
  const navigate = useNavigate()
  const mainNavRef = useRef<HTMLDivElement>(null)
  const setLayoutHeight = useStore((state) => state.layout.setLayoutHeight)
  const bannerHeight = useStore((state) => state.layout.height.globalAlert)
  const footerHeight = useHeightResizeObserver(mainNavRef)

  useEffect(() => {
    setLayoutHeight('globalAlert', footerHeight)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [footerHeight])

  const { rLocalePathname, rNetwork } = getParamsFromUrl()

  const connectState = useStore((state) => state.connectState)
  const isAdvancedMode = useStore((state) => state.isAdvanceMode)
  const locale = useStore((state) => state.locale)
  const routerProps = useStore((state) => state.routerProps)
  const themeType = useStore((state) => state.themeType)
  const setAppCache = useStore((state) => state.setAppCache)
  const updateConnectState = useStore((state) => state.updateConnectState)
  const isMdUp = useMediaQuery(isMdUpQuery, { noSsr: true })
  const { data: tvl } = useTvl(chainId)

  const { params: routerParams, location } = routerProps ?? {}
  const routerPathname = location?.pathname ?? ''
  const routerNetwork = routerParams?.network

  const theme = (themeType as string) == 'default' ? 'light' : themeType
  return (
    <NewHeader<ChainId>
      networkName={rNetwork}
      mainNavRef={mainNavRef}
      locale={locale}
      isMdUp={isMdUp}
      advancedMode={[
        isAdvancedMode,
        useCallback((isAdvanced) => setAppCache('isAdvanceMode', isAdvanced), [setAppCache]),
      ]}
      currentApp="lend"
      pages={useMemo(
        () => _parseRouteAndIsActive(APP_LINK.lend.pages, rLocalePathname, routerPathname, routerNetwork),
        [rLocalePathname, routerNetwork, routerPathname],
      )}
      themes={[
        theme,
        useCallback((selectedThemeType: ThemeKey) => setAppCache('themeType', selectedThemeType), [setAppCache]),
      ]}
      ChainProps={{
        options: visibleNetworksList,
        theme,
        disabled: isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK),
        chainId: chainId,
        onChange: useCallback(
          (selectedChainId: ChainId) => {
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
          },
          [chainId, rLocalePathname, updateConnectState, navigate],
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
      appStats={[
        {
          label: 'TVL',
          value: (tvl && formatNumber(tvl, { ...FORMAT_OPTIONS.USD, notation: 'compact' })) || '',
        },
      ]}
      height={useHeaderHeight(bannerHeight)}
      BannerProps={BannerProps}
      sections={sections}
    />
  )
}

export default Header
