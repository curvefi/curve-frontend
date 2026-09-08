import type { ReactNode } from 'react'
import { formatDate } from '@legacy-ui/utils'
import { Banner } from '@ui/features/banners/Banner'
import { StackBanners } from '@ui/features/banners/StackBanners'
import { BackendMaintenanceBanner } from '@ui/features/maintenance/components/BackendMaintenanceBanner'
import type { Maintenance } from '@ui/features/maintenance/hooks/useMaintenance'
import {
  useDismissCurveLiteBanner,
  useDismissPhishingWarn,
  useReleaseChannel,
} from '@ui/features/storage/useLocalStorage'
import { useCurrentDate } from '@ui/hooks/useCurrentDate'
import { IS_CYPRESS, IS_PREVIEW_HOST, ReleaseChannel } from '@ui/lib/env'
import { t } from '@ui/lib/i18n'

export type GlobalBannerProps = {
  rootUrl: string
  blockchainId: string
  chainName: string
  chainId: number
  backendMaintenance: Maintenance
  deprecationDate: Date
  isDowngraded: boolean
  connectError: Error | undefined
  isConnected: boolean
  switchChain: ({ chainId }: { chainId: number }) => Promise<unknown>
  walletChainId: number
  children: ReactNode
}

export const GlobalBanner = ({
  rootUrl,
  blockchainId,
  chainName,
  chainId,
  backendMaintenance,
  deprecationDate,
  isDowngraded,
  connectError,
  isConnected,
  switchChain,
  walletChainId,
  children,
}: GlobalBannerProps) => {
  const [releaseChannel, setReleaseChannel] = useReleaseChannel()
  const [showDowngraded, dismissDowngraded] = useDismissCurveLiteBanner(chainId)
  const [shouldShowPhishingBanner, dismissShowPhishingBanner] = useDismissPhishingWarn()
  const currentDate = useCurrentDate()

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
      {!IS_PREVIEW_HOST && shouldShowPhishingBanner && (
        <Banner
          subtitle={t`Always carefully check that your URL is ${rootUrl}.`}
          severity="warning"
          onClick={dismissShowPhishingBanner}
          testId="phishing-warning-banner"
        >
          {t`Make sure you are on the right domain`}
        </Banner>
      )}
      {connectError ? (
        <Banner severity="alert">
          {[connectError.message, t`Please try to switch your RPC in your wallet settings.`].join(' ')}
        </Banner>
      ) : (
        isConnected &&
        chainId &&
        walletChainId != chainId && (
          <Banner severity="warning" buttonText={t`Change network`} onClick={() => void switchChain({ chainId })}>
            {t`Please switch your wallet's network to`} <strong>{blockchainId}</strong> {t`to use Curve on`}{' '}
            <strong>{blockchainId}</strong>.{' '}
          </Banner>
        )
      )}
      {deprecationDate ? (
        <Banner severity="alert">
          {`“${chainName}”${
            deprecationDate > currentDate
              ? t` will be deprecated at ${formatDate(deprecationDate)}. `
              : t` is deprecated. `
          }`}
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
            {`“${chainName}”${t` has been moved to curve-lite due to low activity. `}`}
          </Banner>
        )
      )}
      {children}
    </StackBanners>
  )
}
