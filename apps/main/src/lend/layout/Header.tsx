import { useCallback, useMemo, useRef } from 'react'
import { t } from '@ui-kit/lib/i18n'
import { CONNECT_STAGE } from '@/lend/constants'
import { getNetworkFromUrl, getRestFullPathname, getRestPartialPathname } from '@/lend/utils/utilsRouter'
import { _parseRouteAndIsActive, FORMAT_OPTIONS, formatNumber, isLoading } from '@ui/utils'
import { getWalletSignerAddress, useWallet } from '@ui-kit/features/connect-wallet'
import networks, { visibleNetworksList } from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import { useTvl } from '@/lend/entities/chain'
import { Header as NewHeader, useHeaderHeight } from '@ui-kit/widgets/Header'
import useMediaQuery from '@mui/material/useMediaQuery'
import { type Theme } from '@mui/material/styles'
import type { NavigationSection } from '@ui-kit/widgets/Header/types'
import { APP_LINK } from '@ui-kit/shared/routes'
import { GlobalBannerProps } from '@ui/Banner/GlobalBanner'
import { ChainId, type UrlParams } from '@/lend/types/lend.types'
import { useParams, usePathname, useRouter } from 'next/navigation'

type HeaderProps = { chainId: ChainId; sections: NavigationSection[]; BannerProps: GlobalBannerProps }

const isMdUpQuery = (theme: Theme) => theme.breakpoints.up('tablet')

const Header = ({ chainId, sections, BannerProps }: HeaderProps) => {
  const { wallet } = useWallet()
  const { push: navigate } = useRouter()
  const mainNavRef = useRef<HTMLDivElement>(null)
  const bannerHeight = useStore((state) => state.layout.height.globalAlert)

  const { rNetwork } = getNetworkFromUrl()

  const connectState = useStore((state) => state.connectState)
  const updateConnectState = useStore((state) => state.updateConnectState)
  const isMdUp = useMediaQuery(isMdUpQuery, { noSsr: true })
  const { data: tvl } = useTvl(chainId)

  const routerParams = useParams() as UrlParams
  const routerPathname = usePathname()
  const routerNetwork = routerParams?.network

  return (
    <NewHeader<ChainId>
      networkName={rNetwork}
      mainNavRef={mainNavRef}
      isMdUp={isMdUp}
      currentApp="lend"
      pages={useMemo(
        () => _parseRouteAndIsActive(APP_LINK.lend.pages, routerPathname, routerNetwork),
        [routerNetwork, routerPathname],
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
              const path = currPath.endsWith('markets') ? getRestFullPathname() : getRestPartialPathname()
              navigate(`/${network}/${path}`)
              updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [chainId, selectedChainId])
            }
          },
          [chainId, updateConnectState, navigate],
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
