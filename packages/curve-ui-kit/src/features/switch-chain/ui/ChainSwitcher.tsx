import IconButton from '@mui/material/IconButton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { useEffect, useMemo } from 'react'
import { ThemeKey } from '@ui-kit/themes/basic-theme'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { t } from '@lingui/macro'
import { SettingsButton } from './SettingsButton'
import { ChainSwitcherIcon } from './ChainSwitcherIcon'
import { ChainList } from './ChainList'
import { ChainSettings } from './ChainSettings'
import { useLocalStorage } from '@ui-kit/hooks/useLocalStorage'

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
}

export const ChainSwitcher = <TChainId extends number>({
  options,
  chainId,
  onChange,
  disabled,
}: ChainSwitcherProps<TChainId>) => {
  const [isOpen, , close, toggle] = useSwitch()
  const [isSettingsOpen, openSettings, closeSettings] = useSwitch()
  const [showTestnets, setShowTestnets] = useLocalStorage<boolean>('showTestnets', false)
  const selectedNetwork = useMemo(() => options.find((o) => o.chainId === chainId) ?? options[0], [options, chainId])

  useEffect(() => () => close(), [chainId, close]) // close on chain change

  if (options.length <= 1) {
    return null
  }

  return (
    <>
      <IconButton size="small" disabled={disabled} onClick={toggle} data-testid="btn-change-chain">
        <ChainSwitcherIcon chain={selectedNetwork} />
        <KeyboardArrowDownIcon />
      </IconButton>
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
