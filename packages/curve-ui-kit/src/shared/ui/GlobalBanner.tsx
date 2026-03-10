import { useChainId, useConnection, useSwitchChain } from 'wagmi'
import { isFailure, useCurve, type WagmiChainId } from '@ui-kit/features/connect-wallet'
import { usePathname } from '@ui-kit/hooks/router'
import { useDismissBanner, useReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { getCurrentApp } from '@ui-kit/shared/routes'
import { Banner } from '@ui-kit/shared/ui/Banner'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { isCypress, ReleaseChannel } from '@ui-kit/utils'
import { Chain } from '@ui-kit/utils/network'
import { PhishingWarningBanner } from '@ui-kit/widgets/Header/PhishingWarningBanner'
import { StackBanners } from './StackBanners'

export type GlobalBannerProps = {
  networkId: string
  chainId: number
}

// Update `PUBLIC_MAINTENANCE_MESSAGE` environment variable value to display a global message in app.
const maintenanceMessage = process.env.PUBLIC_MAINTENANCE_MESSAGE

export const GlobalBanner = ({ networkId, chainId }: GlobalBannerProps) => {
  const [releaseChannel, setReleaseChannel] = useReleaseChannel()
  const { isConnected } = useConnection()
  const { switchChain } = useSwitchChain()
  const { connectState } = useCurve()
  const walletChainId = useChainId()
  const pathname = usePathname()
  const currentApp = getCurrentApp(pathname)

  const showSwitchNetworkMessage = isConnected && chainId && walletChainId != chainId
  const showConnectApiErrorMessage = !showSwitchNetworkMessage && isFailure(connectState)

  const { shouldShowBanner: showAaveBanner, dismissBanner: dismissAaveBanner } = useDismissBanner(
    'aave-v2-frozen-avalanche-polygon',
    Duration.Banner.Monthly,
  )
  return (
    <StackBanners>
      {releaseChannel !== ReleaseChannel.Stable && !isCypress && (
        <Banner
          icon="llama"
          onClick={() => setReleaseChannel(ReleaseChannel.Stable)}
          buttonText={t`Disable ${releaseChannel} Mode`}
        >
          {t`${releaseChannel} Mode Enabled`}
        </Banner>
      )}
      <PhishingWarningBanner />
      {maintenanceMessage && <Banner severity="warning">{maintenanceMessage}</Banner>}
      {showSwitchNetworkMessage && (
        <Banner
          severity="warning"
          buttonText={t`Change network`}
          onClick={() => switchChain({ chainId: chainId as WagmiChainId })}
        >
          {t`Please switch your wallet's network to`} <strong>{networkId}</strong> {t`to use Curve on`}{' '}
          <strong>{networkId}</strong>.{' '}
        </Banner>
      )}
      {showConnectApiErrorMessage && (
        <Banner severity="alert">
          {t`There is an issue connecting to the API. Please try to switch your RPC in your wallet settings.`}
        </Banner>
      )}
      {showAaveBanner && currentApp === 'dex' && [Chain.Polygon, Chain.Avalanche].includes(chainId) && (
        <Banner
          severity="info"
          subtitle={t`Aave is deprecating its V2 markets on Polygon and Avalanche. Deposits and swaps are not supported`}
          onClick={dismissAaveBanner}
          learnMoreUrl="https://governance.aave.com/t/direct-to-aip-aave-v2-non-ethereum-pools-next-deprecation-steps/22445"
        >
          {t`Aave V2 Frozen aTokens`}
        </Banner>
      )}
    </StackBanners>
  )
}
