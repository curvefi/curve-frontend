import lodash from 'lodash'
import { useEffect, useMemo } from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import IconButton from '@mui/material/IconButton'
import { NetworkMapping } from '@ui/utils'
import { useLayoutStore } from '@ui-kit/features/layout'
import { usePathname } from '@ui-kit/hooks/router'
import { useShowTestNets } from '@ui-kit/hooks/useLocalStorage'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { getCurrentNetwork } from '@ui-kit/shared/routes'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { ModalSettingsButton } from '@ui-kit/shared/ui/ModalSettingsButton'
import { Toast } from '@ui-kit/shared/ui/Toast'
import { ChainList } from './ChainList'
import { ChainSettings } from './ChainSettings'
import { ChainSwitcherIcon } from './ChainSwitcherIcon'

export type ChainSwitcherProps = {
  networks: NetworkMapping
}

export const ChainSwitcher = ({ networks }: ChainSwitcherProps) => {
  const networkId = getCurrentNetwork(usePathname())
  const [isOpen, , close, toggle] = useSwitch()
  const [isSnackbarOpen, openSnackbar, hideSnackbar] = useSwitch()
  const [isSettingsOpen, openSettings, closeSettings] = useSwitch()
  const [showTestnets, setShowTestnets] = useShowTestNets()
  useEffect(() => () => close(), [networkId, close]) // close on chain change

  const options = useMemo(
    () =>
      lodash.sortBy(
        Object.values(networks).filter((networkConfig) => networkConfig.showInSelectNetwork),
        (n) => n.name,
      ),
    [networks],
  )

  const onClick = options.length > 1 ? toggle : openSnackbar
  const top = useLayoutStore((state) => state.navHeight)
  return (
    <>
      <IconButton size="small" onClick={onClick} data-testid="btn-change-chain">
        {networkId && <ChainSwitcherIcon networkId={networkId} />}
        {Object.values(options).length > 1 && <KeyboardArrowDownIcon />}
      </IconButton>

      <Toast
        open={isSnackbarOpen}
        onClose={hideSnackbar}
        severity="warning"
        sx={{ top }}
        title={t`This application is only available on the Ethereum Mainnet`}
        data-testid="alert-eth-only"
      />

      {isOpen != null && (
        <ModalDialog
          open={isOpen}
          onClose={close}
          title={isSettingsOpen ? t`Select Network Settings` : t`Select Network`}
          titleAction={
            isSettingsOpen && (
              <IconButton onClick={closeSettings} size="extraSmall">
                <ArrowBackIcon />
              </IconButton>
            )
          }
          footer={!isSettingsOpen && <ModalSettingsButton onClick={openSettings} />}
        >
          {isSettingsOpen ? (
            <ChainSettings showTestnets={showTestnets} setShowTestnets={setShowTestnets} />
          ) : (
            <ChainList showTestnets={showTestnets} options={options} selectedNetworkId={networkId} />
          )}
        </ModalDialog>
      )}
    </>
  )
}
