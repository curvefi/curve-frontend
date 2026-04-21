import { useChainId, useConnection } from 'wagmi'
import { formatDate } from '@ui/utils'
import {
  DEPRECATED_CHAINS,
  isFailure,
  useCurve,
  useSwitchChain,
  type WagmiChainId,
} from '@ui-kit/features/connect-wallet'
import { DOWNGRADED_CHAINS } from '@ui-kit/features/connect-wallet/lib/wagmi/chains'
import { usePathname } from '@ui-kit/hooks/router'
import {
  useDismissAaveBanner,
  useDismissCurveLiteBanner,
  useDismissFastBridgeBanner,
  useReleaseChannel,
} from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { getCurrentApp } from '@ui-kit/shared/routes'
import { Banner } from '@ui-kit/shared/ui/Banner'
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
  const { connectState, network } = useCurve()
  const switchChain = useSwitchChain()
  const walletChainId = useChainId()
  const pathname = usePathname()
  const currentApp = getCurrentApp(pathname)
  const deprecationDate = DEPRECATED_CHAINS[chainId]
  const isDowngraded = DOWNGRADED_CHAINS.has(chainId)

  const [showAaveBanner, dismissAaveBanner] = useDismissAaveBanner()
  const [showDowngraded, dismissDowngraded] = useDismissCurveLiteBanner(chainId)
  const [showFastBridgeBanner, dismissFastBridgeBanner] = useDismissFastBridgeBanner()

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
      {isFailure(connectState) ? (
        <Banner severity="alert">
          {t`There is an issue connecting to the API. Please try to switch your RPC in your wallet settings.`}
        </Banner>
      ) : (
        isConnected &&
        chainId &&
        walletChainId != chainId && (
          <Banner
            severity="warning"
            buttonText={t`Change network`}
            onClick={() => void switchChain({ chainId: chainId as WagmiChainId })}
          >
            {t`Please switch your wallet's network to`} <strong>{networkId}</strong> {t`to use Curve on`}{' '}
            <strong>{networkId}</strong>.{' '}
          </Banner>
        )
      )}
      {deprecationDate ? (
        <Banner severity="alert">
          {`“${network?.name}”` +
            (deprecationDate > new Date()
              ? t` will be deprecated at ${formatDate(deprecationDate)}. `
              : t` is deprecated. `)}
          {t`Future management of positions will only be possible via the chain explorer. `}
          {t`Manage your positions accordingly. `}
        </Banner>
      ) : (
        showDowngraded &&
        isDowngraded && (
          <Banner
            severity="info"
            subtitle={t`Advanced metrics won’t be available anymore, but all functions remain available. `}
            onClick={dismissDowngraded}
          >
            {`“${network?.name}”` + t` has been moved to curve-lite due to low activity. `}
          </Banner>
        )
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
      {showFastBridgeBanner && currentApp === 'bridge' && (
        <Banner
          severity="warning"
          subtitle={t`Fastbridge has been temporarily paused as a precaution following the rsETH incident. No issues have been identified for Curve's applications.`}
          onClick={dismissFastBridgeBanner}
          learnMoreUrl="https://x.com/CurveFinance/status/2045868949892378783?s=20"
        >
          {t`Fastbridge is paused`}
        </Banner>
      )}
    </StackBanners>
  )
}
