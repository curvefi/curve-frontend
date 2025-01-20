import { useCallback, useMemo, useRef } from 'react'
import { t } from '@lingui/macro'
import { useLocation, useNavigate } from 'react-router-dom'
import { CONNECT_STAGE } from '@lend/constants'
import { getParamsFromUrl, getRestFullPathname, getRestPartialPathname } from '@lend/utils/utilsRouter'
import { _parseRouteAndIsActive, FORMAT_OPTIONS, formatNumber, isLoading } from '@ui/utils'
import { getWalletSignerAddress, useConnectWallet } from '@ui-kit/features/connect-wallet'
import networks, { visibleNetworksList } from '@lend/networks'
import useStore from '@lend/store/useStore'
import { useTvl } from '@lend/entities/chain'
import { Header as NewHeader, useHeaderHeight } from '@ui-kit/widgets/Header'
import useMediaQuery from '@mui/material/useMediaQuery'
import { type Theme } from '@mui/material/styles'
import type { NavigationSection } from '@ui-kit/widgets/Header/types'
import { APP_LINK } from '@ui-kit/shared/routes'
import { GlobalBannerProps } from '@ui/Banner/GlobalBanner'
import { ChainId } from '@lend/types/lend.types'
import { useWalletStore } from '@ui-kit/features/connect-wallet'

type HeaderProps = { chainId: ChainId; sections: NavigationSection[]; BannerProps: GlobalBannerProps }

const isMdUpQuery = (theme: Theme) => theme.breakpoints.up('tablet')

const Header = ({ chainId, sections, BannerProps }: HeaderProps) => {
  const [{ wallet }] = useConnectWallet()
  const navigate = useNavigate()
  const mainNavRef = useRef<HTMLDivElement>(null)
  const bannerHeight = useStore((state) => state.layout.height.globalAlert)

  const { rLocalePathname, rNetwork } = getParamsFromUrl()

  const connectState = useWalletStore((s) => s.connectState)
  const routerProps = useStore((state) => state.routerProps)
  const updateConnectState = useStore((state) => state.updateConnectState)
  const isMdUp = useMediaQuery(isMdUpQuery, { noSsr: true })
  const { data: tvl } = useTvl(chainId)

  const location = useLocation()
  const { params: routerParams } = routerProps ?? {}
  const routerPathname = location?.pathname ?? ''
  const routerNetwork = routerParams?.network

  return (
    <NewHeader<ChainId>
      networkName={rNetwork}
      mainNavRef={mainNavRef}
      isMdUp={isMdUp}
      currentApp="lend"
      pages={useMemo(
        () => _parseRouteAndIsActive(APP_LINK.lend.pages, rLocalePathname, routerPathname, routerNetwork),
        [rLocalePathname, routerNetwork, routerPathname],
      )}
      ChainProps={{
        options: visibleNetworksList,
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
