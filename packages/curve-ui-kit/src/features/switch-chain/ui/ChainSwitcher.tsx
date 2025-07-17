import lodash from 'lodash'
import { useEffect, useMemo } from 'react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import Snackbar from '@mui/material/Snackbar'
import type { NetworkDef, NetworkMapping } from '@ui/utils'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useShowTestNets } from '@ui-kit/hooks/useLocalStorage'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { ModalSettingsButton } from '@ui-kit/shared/ui/ModalSettingsButton'
import { Duration } from '@ui-kit/themes/design/0_primitives'
import { ChainList } from './ChainList'
import { ChainSettings } from './ChainSettings'
import { ChainSwitcherIcon } from './ChainSwitcherIcon'

export type ChainSwitcherProps = {
  chainId: number
  networks: NetworkMapping
}

export const ChainSwitcher = ({ networks, chainId }: ChainSwitcherProps) => {
  const [isOpen, , close, toggle] = useSwitch()
  const [isSnackbarOpen, openSnackbar, hideSnackbar] = useSwitch()
  const [isSettingsOpen, openSettings, closeSettings] = useSwitch()
  const [showTestnets, setShowTestnets] = useShowTestNets()
  useEffect(() => () => close(), [chainId, close]) // close on chain change

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
  const network: NetworkDef | undefined = networks[chainId] // the network may not be defined when switching apps
  return (
    <>
      <IconButton size="small" onClick={onClick} data-testid="btn-change-chain">
        {network && <ChainSwitcherIcon network={network} />}
        {Object.values(options).length > 1 && <KeyboardArrowDownIcon />}
      </IconButton>

      <Snackbar
        open={isSnackbarOpen}
        onClose={hideSnackbar}
        anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
        sx={{ top }}
        autoHideDuration={Duration.Snackbar}
      >
        <Container sx={{ justifyContent: 'end', marginTop: 4 }}>
          <Alert variant="filled" severity="warning" data-testid="alert-eth-only">
            <AlertTitle>{t`This application is only available on the Ethereum Mainnet`}</AlertTitle>
          </Alert>
        </Container>
      </Snackbar>

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
            <ChainList showTestnets={showTestnets} options={options} selectedNetwork={network} />
          )}
        </ModalDialog>
      )}
    </>
  )
}
