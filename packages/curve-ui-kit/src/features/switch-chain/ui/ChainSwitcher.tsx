import lodash from 'lodash'
import { useEffect, useMemo } from 'react'
import { getBlockchainId } from '@curvefi/prices-api'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import IconButton from '@mui/material/IconButton'
import { maybes } from '@primitives/objects.utils'
import { NetworkMapping } from '@ui/utils'
import { type TvlSource, useNetworksTVL } from '@ui-kit/entities/prices-networks.query'
import { usePathname } from '@ui-kit/hooks/router'
import { useShowTestNets } from '@ui-kit/hooks/useLocalStorage'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { type AppMenuOption, getCurrentNetwork } from '@ui-kit/shared/routes'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { ModalSettingsButton } from '@ui-kit/shared/ui/ModalSettingsButton'
import { showToast } from '@ui-kit/widgets/Toast/toast.util'
import { ChainList } from './ChainList'
import { ChainSettings } from './ChainSettings'
import { ChainSwitcherIcon } from './ChainSwitcherIcon'

type ChainSwitcherProps = {
  supportedNetworks: NetworkMapping
  currentMenu: AppMenuOption
}

const TVL_SOURCES: Record<AppMenuOption, TvlSource> = {
  dex: 'pool',
  llamalend: 'lending',
  dao: 'pool',
  bridge: 'lending',
  analytics: 'pool',
}

export const ChainSwitcher = ({ supportedNetworks, currentMenu }: ChainSwitcherProps) => {
  const networkId = getCurrentNetwork(usePathname())

  const [isOpen, , close, toggle] = useSwitch()
  const [isSettingsOpen, openSettings, closeSettings] = useSwitch()
  const [showTestnets, setShowTestnets] = useShowTestNets()
  useEffect(() => () => close(), [networkId, close]) // close on chain change
  const tvls = useNetworksTVL(TVL_SOURCES[currentMenu])

  const options = useMemo(
    () =>
      lodash.orderBy(
        Object.values(supportedNetworks).filter(networkConfig => networkConfig.showInSelectNetwork),
        [n => maybes([getBlockchainId(n.id), tvls.data], (id, tvls) => tvls[id]) ?? 0, 'name'],
        ['desc', 'asc'],
      ),
    [supportedNetworks, tvls.data],
  )

  const onClick =
    options.length > 1
      ? toggle
      : () =>
          showToast({
            title: t`This application is only available on the Ethereum Mainnet`,
            severity: 'warning',
            testId: 'alert-eth-only',
          })
  return (
    <>
      <IconButton size="small" onClick={onClick} data-testid="btn-change-chain">
        {networkId && <ChainSwitcherIcon networkId={networkId} />}
        {Object.values(options).length > 1 && <KeyboardArrowDownIcon />}
      </IconButton>
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
            <ChainList showTestnets={showTestnets} options={options} tvls={tvls} selectedNetworkId={networkId} />
          )}
        </ModalDialog>
      )}
    </>
  )
}
