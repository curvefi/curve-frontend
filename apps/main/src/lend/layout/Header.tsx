import { useCallback, useRef } from 'react'
import { t } from '@ui-kit/lib/i18n'
import { CONNECT_STAGE } from '@/lend/constants'
import { getNetworkFromUrl, getPath, getRestFullPathname } from '@/lend/utils/utilsRouter'
import { FORMAT_OPTIONS, formatNumber, isLoading } from '@ui/utils'
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
import { ChainId, type NetworkEnum, type UrlParams } from '@/lend/types/lend.types'
import { useParams, useRouter } from 'next/navigation'

type HeaderProps = { chainId: ChainId; sections: NavigationSection[]; BannerProps: GlobalBannerProps }

const isMdUpQuery = (theme: Theme) => theme.breakpoints.up('tablet')

const Header = ({ chainId, sections, BannerProps }: HeaderProps) => {
  const { wallet } = useWallet()
  const { push } = useRouter()
  const mainNavRef = useRef<HTMLDivElement>(null)
  const bannerHeight = useStore((state) => state.layout.height.globalAlert)
  const { rNetwork } = getNetworkFromUrl()
  const connectState = useStore((state) => state.connectState)
  const updateConnectState = useStore((state) => state.updateConnectState)
  const isMdUp = useMediaQuery(isMdUpQuery, { noSsr: true })
  const { data: tvl } = useTvl(chainId)
  const routerParams = useParams() as UrlParams

  return (
    <NewHeader<ChainId>
      networkName={rNetwork}
      mainNavRef={mainNavRef}
      isMdUp={isMdUp}
      currentApp="lend"
      pages={APP_LINK.lend.pages}
      ChainProps={{
        options: visibleNetworksList,
        disabled: isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK),
        chainId: chainId,
        onChange: useCallback(
          (selectedChainId: ChainId) => {
            if (chainId !== selectedChainId) {
              const network = networks[selectedChainId as ChainId].id as NetworkEnum
              push(getPath({ network }, `/${getRestFullPathname()}`))
              updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [chainId, selectedChainId])
            }
          },
          [chainId, updateConnectState, push],
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
