import { useChainId, useConnection, useSwitchChain } from 'wagmi'
import Box from '@mui/material/Box'
import { isFailure, useCurve, type WagmiChainId } from '@ui-kit/features/connect-wallet'
import { useReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { Banner } from '@ui-kit/shared/ui/Banner'
import { isCypress, ReleaseChannel } from '@ui-kit/utils'
import { PhishingWarningBanner } from '@ui-kit/widgets/Header/PhishingWarningBanner'

export type GlobalBannerProps = {
  networkId: string
  chainId: number
}

// Update `NEXT_PUBLIC_MAINTENANCE_MESSAGE` environment variable value to display a global message in app.
const maintenanceMessage = process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE

export const GlobalBanner = ({ networkId, chainId }: GlobalBannerProps) => {
  const [releaseChannel, setReleaseChannel] = useReleaseChannel()
  const { isConnected } = useConnection()
  const { switchChain } = useSwitchChain()
  const { connectState } = useCurve()
  const walletChainId = useChainId()
  const showSwitchNetworkMessage = isConnected && chainId && walletChainId != chainId
  const showConnectApiErrorMessage = !showSwitchNetworkMessage && isFailure(connectState)
  return (
    <Box>
      <PhishingWarningBanner />
      {releaseChannel !== ReleaseChannel.Stable && !isCypress && (
        <Banner
          icon="llama"
          onClick={() => setReleaseChannel(ReleaseChannel.Stable)}
          buttonText={t`Disable ${releaseChannel} Mode`}
        >
          {t`${releaseChannel} Mode Enabled`}
        </Banner>
      )}
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
    </Box>
  )
}
