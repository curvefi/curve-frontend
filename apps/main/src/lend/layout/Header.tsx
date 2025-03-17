import { useRouter } from 'next/navigation'
import { useCallback, useRef } from 'react'
import { CONNECT_STAGE } from '@/lend/constants'
import { useTvl } from '@/lend/entities/chain'
import networks, { visibleNetworksList } from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import { ChainId, type NetworkEnum } from '@/lend/types/lend.types'
import { getNetworkFromUrl, getPath, getRestFullPathname } from '@/lend/utils/utilsRouter'
import { type Theme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { GlobalBannerProps } from '@ui/Banner/GlobalBanner'
import { FORMAT_OPTIONS, formatNumber, isLoading } from '@ui/utils'
import { getWalletSignerAddress, useWallet } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { APP_LINK } from '@ui-kit/shared/routes'
import { Header as NewHeader, useHeaderHeight } from '@ui-kit/widgets/Header'
import type { NavigationSection } from '@ui-kit/widgets/Header/types'

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
  const { data: tvl } = useTvl(chainId)

  return (
    <NewHeader<ChainId>
      networkName={rNetwork}
      mainNavRef={mainNavRef}
      currentMenu="llama"
      routes={APP_LINK.llama.routes}
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
