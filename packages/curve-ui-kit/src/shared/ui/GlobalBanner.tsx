import { forwardRef, Ref } from 'react'
import Box from '@mui/material/Box'
import { useLocalStorage } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { BannerMessage } from '@ui-kit/shared/ui/BannerMessage'
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
    const [isBeta, setIsBeta] = useLocalStorage<boolean>('beta')
    return (
      (showSwitchNetworkMessage || showConnectApiErrorMessage || maintenanceMessage || isBeta) && (
        <Box ref={ref}>
          {isBeta && (
            <BannerMessage severity="info" onClick={() => setIsBeta(false)} buttonText={t`Disable Beta Mode`}>
              <LlamaIcon sx={{ width: IconSize.sm, height: IconSize.sm }} /> {t`BETA MODE ENABLED`}
            </BannerMessage>
          )}
          {maintenanceMessage && <BannerMessage severity="warning">{maintenanceMessage}</BannerMessage>}
          {showSwitchNetworkMessage && (
            <BannerMessage severity="error" buttonText={t`Change network`} onClick={handleNetworkChange}>
              {t`Please switch your wallet's network to`} <strong>{networkName}</strong> {t`to use Curve on`}{' '}
              <strong>{networkName}</strong>.{' '}
            </BannerMessage>
          )}
          {showConnectApiErrorMessage && (
            <BannerMessage severity="error">
              {t`There is an issue connecting to the API. You can try switching your RPC or, if you are connected to a wallet, please switch to a different one.`}
            </BannerMessage>
          )}
        </Box>
      )
    )
  },
)
GlobalBanner.displayName = 'GlobalBanner'
