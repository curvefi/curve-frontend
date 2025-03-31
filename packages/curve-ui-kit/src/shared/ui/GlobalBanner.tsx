import { forwardRef, Ref } from 'react'
import Box from '@mui/material/Box'
import { useBetaFlag } from '@ui-kit/hooks/useBetaFlag'
import { t } from '@ui-kit/lib/i18n'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { Banner } from '@ui-kit/shared/ui/Banner'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

export type GlobalBannerProps = {
  networkName: string
  showConnectApiErrorMessage: boolean
  showSwitchNetworkMessage: boolean
  maintenanceMessage?: string
  handleNetworkChange(): void
  ref: Ref<HTMLDivElement>
}

const { IconSize } = SizesAndSpaces

export const GlobalBanner = forwardRef<HTMLDivElement, Omit<GlobalBannerProps, 'ref'>>(
  (
    { networkName, showConnectApiErrorMessage, showSwitchNetworkMessage, maintenanceMessage, handleNetworkChange },
    ref,
  ) => {
    const [isBeta, setIsBeta] = useBetaFlag()
    return (
      (showSwitchNetworkMessage || showConnectApiErrorMessage || maintenanceMessage || isBeta) && (
        <Box ref={ref}>
          {isBeta && (
            <Banner onClick={() => setIsBeta(false)} buttonText={t`Disable Beta Mode`}>
              <LlamaIcon sx={{ width: IconSize.sm, height: IconSize.sm }} /> {t`BETA MODE ENABLED`}
            </Banner>
          )}
          {maintenanceMessage && <Banner severity="warning">{maintenanceMessage}</Banner>}
          {showSwitchNetworkMessage && (
            <Banner severity="warning" buttonText={t`Change network`} onClick={handleNetworkChange}>
              {t`Please switch your wallet's network to`} <strong>{networkName}</strong> {t`to use Curve on`}{' '}
              <strong>{networkName}</strong>.{' '}
            </Banner>
          )}
          {showConnectApiErrorMessage && (
            <Banner severity="alert">
              {t`There is an issue connecting to the API. You can try switching your RPC or, if you are connected to a wallet, please switch to a different one.`}
            </Banner>
          )}
        </Box>
      )
    )
  },
)
GlobalBanner.displayName = 'GlobalBanner'
