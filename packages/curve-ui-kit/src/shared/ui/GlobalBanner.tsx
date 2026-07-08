import { useChainId, useConnection } from 'wagmi'
import { formatDate } from '@ui/utils'
import { DEPRECATED_CHAINS, isFailure, useCurve, useSwitchChain } from '@ui-kit/features/connect-wallet'
import { DOWNGRADED_CHAINS } from '@ui-kit/features/connect-wallet/lib/wagmi/chains'
import { BackendMaintenanceBanner } from '@ui-kit/features/maintenance/components/BackendMaintenanceBanner'
import type { Maintenance } from '@ui-kit/features/maintenance/hooks/useMaintenance'
import { usePathname } from '@ui-kit/hooks/router'
import { useCurrentDate } from '@ui-kit/hooks/useCurrentDate'
import {
  useDismissAaveBanner,
  useDismissCurveLiteBanner,
  useDismissFantomRetirementBanner,
  useReleaseChannel,
} from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { getCurrentApp } from '@ui-kit/shared/routes'
import { Banner } from '@ui-kit/shared/ui/Banner'
import { IS_CYPRESS, ReleaseChannel } from '@ui-kit/utils'
import { Chain } from '@ui-kit/utils/network'
import { PhishingWarningBanner } from '@ui-kit/widgets/Header/PhishingWarningBanner'
import { StackBanners } from './StackBanners'

type GlobalBannerProps = {
  networkId: string
  chainId: number
  backendMaintenance: Maintenance
}

export const GlobalBanner = ({ networkId, chainId, backendMaintenance }: GlobalBannerProps) => {
  const [releaseChannel, setReleaseChannel] = useReleaseChannel()
  const { isConnected } = useConnection()
  const { connectState, network } = useCurve()
  const switchChain = useSwitchChain()
  const walletChainId = useChainId()
  const pathname = usePathname()
  const currentApp = getCurrentApp(pathname)
  const deprecationDate = DEPRECATED_CHAINS[chainId]
  const isDowngraded = DOWNGRADED_CHAINS.has(chainId)
  const currentDate = useCurrentDate()

  const [showAaveBanner, dismissAaveBanner] = useDismissAaveBanner()
  const [showFantomRetirementBanner, dismissFantomRetirementBanner] = useDismissFantomRetirementBanner()
  const [showDowngraded, dismissDowngraded] = useDismissCurveLiteBanner(chainId)

  return (
    <StackBanners>
      {releaseChannel !== ReleaseChannel.Stable && !IS_CYPRESS && (
        <Banner
          icon="llama"
          onClick={() => setReleaseChannel(ReleaseChannel.Stable)}
          buttonText={t`Disable ${releaseChannel} Mode`}
        >
          {t`${releaseChannel} Mode Enabled`}
        </Banner>
      )}
      {backendMaintenance.showBanner && !IS_CYPRESS && <BackendMaintenanceBanner {...backendMaintenance} />}
      <PhishingWarningBanner />
      {isFailure(connectState) ? (
        <Banner severity="alert">
          {t`There is an issue connecting to the API. Please try to switch your RPC in your wallet settings.`}
        </Banner>
      ) : (
        isConnected &&
        chainId &&
        walletChainId != chainId && (
          <Banner severity="warning" buttonText={t`Change network`} onClick={() => void switchChain({ chainId })}>
            {t`Please switch your wallet's network to`} <strong>{networkId}</strong> {t`to use Curve on`}{' '}
            <strong>{networkId}</strong>.{' '}
          </Banner>
        )
      )}
      {deprecationDate ? (
        <Banner severity="alert">
          {`“${network?.name}”` +
            (deprecationDate > currentDate
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
      {showFantomRetirementBanner && chainId === +Chain.Fantom && (
        <Banner
          severity="alert"
          subtitle={t`The Fantom chain will be retired at the end of the year. Please withdraw from pools.`}
          onClick={dismissFantomRetirementBanner}
          learnMoreUrl="https://x.com/SonicLabs/status/2041551455254097988"
        >
          {t`Fantom Retirement`}
        </Banner>
      )}
    </StackBanners>
  )
}
