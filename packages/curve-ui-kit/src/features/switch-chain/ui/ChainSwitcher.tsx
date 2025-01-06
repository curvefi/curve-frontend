import IconButton from '@mui/material/IconButton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { useEffect, useMemo } from 'react'
import { ThemeKey } from '@ui-kit/themes/basic-theme'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { t } from '@lingui/macro'
import { SettingsButton } from './SettingsButton'
import { ChainIcon } from './ChainIcon'
import { ChainList } from './ChainList'
import { ChainSettings } from './ChainSettings'
import { useLocalStorage } from '@ui-kit/hooks/useLocalStorage'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import { Duration } from 'curve-ui-kit/src/themes/design/0_primitives'

export type ChainOption<TChainId> = {
  chainId: TChainId
  label: string
  src: string
  srcDark: string
  isTestnet: boolean
}

export type ChainSwitcherProps<TChainId> = {
  chainId: TChainId
  options: ChainOption<TChainId>[]
  onChange: (chainId: TChainId) => void
  disabled?: boolean
  theme: ThemeKey
  headerHeight: string
}

export const ChainSwitcher = <TChainId extends number>({
  options,
  chainId,
  onChange,
  disabled,
  headerHeight,
}: ChainSwitcherProps<TChainId>) => {
  const [isOpen, , close, toggle] = useSwitch()
  const [isSnackbarOpen, openSnackbar, hideSnackbar] = useSwitch()
  const [isSettingsOpen, openSettings, closeSettings] = useSwitch()
  const [showTestnets, setShowTestnets] = useLocalStorage<boolean>('showTestnets', false)
  const selectedNetwork = useMemo(() => options.find((o) => o.chainId === chainId) ?? options[0], [options, chainId])

  useEffect(() => () => close(), [chainId, close]) // close on chain change

  const onClick = options.length > 1 ? toggle : openSnackbar
  return (
    <>
      <IconButton size="small" disabled={disabled} onClick={onClick} data-testid="btn-change-chain">
        <ChainIcon chain={selectedNetwork} />
        {options.length > 1 && <KeyboardArrowDownIcon />}
      </IconButton>

      <Snackbar
        open={isSnackbarOpen}
        onClose={hideSnackbar}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{ top: headerHeight, marginTop: 4 }}
        autoHideDuration={Duration.Snackbar * 100}
      >
        <Alert variant="filled" severity="warning" data-testid="alert-eth-only">
          {t`This application is only available on the Ethereum Mainnet`}
        </Alert>
      </Snackbar>

      {isOpen != null && (
        <ModalDialog
          open={isOpen}
          onClose={close}
          title={isSettingsOpen ? t`Select Network Settings` : t`Select Network`}
          titleAction={
            isSettingsOpen && (
              <IconButton onClick={closeSettings}>
                <ArrowBackIcon />
              </IconButton>
            )
          }
          footer={!isSettingsOpen && <SettingsButton onClick={openSettings} />}
        >
          {isSettingsOpen ? (
            <ChainSettings showTestnets={showTestnets} setShowTestnets={setShowTestnets} />
          ) : (
            <ChainList<TChainId>
              showTestnets={showTestnets}
              onChange={onChange}
              options={options}
              selectedNetwork={selectedNetwork}
            />
          )}
        </ModalDialog>
      )}
    </>
  )
}
