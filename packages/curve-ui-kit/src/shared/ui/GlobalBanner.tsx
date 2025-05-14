import { forwardRef, Ref } from 'react'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { Stack, Typography } from '@mui/material'
import AlertTitle from '@mui/material/AlertTitle'
import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import { useTheme } from '@mui/material/styles'
import { CONNECT_STAGE, isFailure, useConnection } from '@ui-kit/features/connect-wallet'
import type { WagmiChainId } from '@ui-kit/features/connect-wallet/lib/wagmi/chains'
import { useBetaFlag, useNewDomainNotificationSeen } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { Banner } from '@ui-kit/shared/ui/Banner'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { isCypress } from '@ui-kit/utils'

export type GlobalBannerProps = {
  networkId: string
  chainId: number
  ref: Ref<HTMLDivElement>
}

const { IconSize, Spacing } = SizesAndSpaces

// Update `NEXT_PUBLIC_MAINTENANCE_MESSAGE` environment variable value to display a global message in app.
const maintenanceMessage = process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE

export const GlobalBanner = forwardRef<HTMLDivElement, Omit<GlobalBannerProps, 'ref'>>(
  ({ networkId, chainId }, ref) => {
    const [isBeta, setIsBeta] = useBetaFlag()
    const showBetaBanner = isBeta && !isCypress

    const [isNewDomainNotificationSeen, setIsNewDomainNotificationSeen] = useNewDomainNotificationSeen()
    const showDomainChangeMessage = !isNewDomainNotificationSeen && new Date() < new Date('2025-06-01') // TODO: delete after this date

    const { isConnected } = useAccount()
    const { switchChain } = useSwitchChain()
    const { connectState } = useConnection()
    const showConnectApiErrorMessage = isFailure(connectState, CONNECT_STAGE.CONNECT_API)
    const walletChainId = useChainId()
    const showSwitchNetworkMessage =
      (isConnected && walletChainId != chainId) || isFailure(connectState, CONNECT_STAGE.SWITCH_NETWORK)

    const warnColor = useTheme().palette.mode === 'dark' ? '#000' : 'textSecondary' // todo: fix this in the design system of the alert component

    return (
      (showSwitchNetworkMessage ||
        showConnectApiErrorMessage ||
        maintenanceMessage ||
        showBetaBanner ||
        showDomainChangeMessage) && (
        <Box ref={ref}>
          {showBetaBanner && (
            <Banner onClick={() => setIsBeta(false)} buttonText={t`Disable Beta Mode`}>
              <LlamaIcon sx={{ width: IconSize.sm, height: IconSize.sm }} /> {t`BETA MODE ENABLED`}
            </Banner>
          )}
          {maintenanceMessage && (
            <Banner severity="warning" color={warnColor}>
              {maintenanceMessage}
            </Banner>
          )}
          {showSwitchNetworkMessage && (
            <Banner
              severity="warning"
              color={warnColor}
              buttonText={t`Change network`}
              onClick={() => switchChain({ chainId: chainId as WagmiChainId })}
            >
              {t`Please switch your wallet's network to`} <strong>{networkId}</strong> {t`to use Curve on`}{' '}
              <strong>{networkId}</strong>.{' '}
            </Banner>
          )}
          {showConnectApiErrorMessage && (
            <Banner severity="alert">
              {t`There is an issue connecting to the API. You can try switching your RPC or, if you are connected to a wallet, please switch to a different one.`}
            </Banner>
          )}
          {showDomainChangeMessage && (
            <Banner
              severity="warning"
              buttonText={t`Dismiss`}
              onClick={() => setIsNewDomainNotificationSeen(true)}
              color={warnColor}
            >
              <Stack direction="row" alignItems="end" gap={Spacing.xxs}>
                <ExclamationTriangleIcon />
                <AlertTitle>{t`Domain Change`}</AlertTitle>
              </Stack>
              <Typography variant="bodySRegular" sx={{ textTransform: 'none' }}>
                {t`Curve Finance has moved to a new domain`}
                {': '}
                <Link href="https://curve.finance" target="_blank" color={warnColor}>
                  {t`curve.finance`}
                </Link>
                {'. '}
                {t`Always make sure you are on the right domain.`} {t`Read the announcement `}
                <Link href="https://x.com/CurveFinance/status/1922210827362349546" target="_blank" color={warnColor}>
                  {t`tweet`}
                </Link>
                .
              </Typography>
            </Banner>
          )}
        </Box>
      )
    )
  },
)
GlobalBanner.displayName = 'GlobalBanner'
