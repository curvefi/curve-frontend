import lodash from 'lodash'
import { useEffect, useMemo } from 'react'
import { getPricesApiBlockchainId } from '@curvefi/prices-api'
import { type TvlSource, useNetworksTVL } from '@evm-ui/entities/prices-networks.query'
import { isChainTestnet } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { usePathname } from '@evm-ui/hooks/router'
import { useShowTestNets } from '@evm-ui/hooks/useLocalStorage'
import { type AppMenuOption, getCurrentNetwork } from '@evm-ui/shared/routes'
import { ModalDialog } from '@evm-ui/shared/ui/ModalDialog'
import { ModalSettingsButton } from '@evm-ui/shared/ui/ModalSettingsButton'
import { showToast } from '@evm-ui/widgets/Toast/toast.util'
import { type NetworkDef, NetworkMapping } from '@legacy-ui/utils'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import IconButton from '@mui/material/IconButton'
import { maybes } from '@primitives/objects.utils'
import { useSwitch } from '@ui/hooks/useSwitch'
import { t } from '@ui/lib/i18n'
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
  dao: 'pool', // kind of irrelevant for tvl, since it only supports mainnet
  bridge: 'pool', // only shows lending chains in the form but shows all networks in selector
  analytics: 'pool', // only has crvUSD charts, but shows all networks in selector
}

const getTvl =
  (tvls: Record<string, number> | undefined) =>
  ({ blockchainId: id, chainId, isLite }: NetworkDef) =>
    isChainTestnet(chainId) || isLite
      ? 0 // ignore lite chains tvl, it's only available for downgraded chains and messes with sorting
      : (maybes([getPricesApiBlockchainId(id), tvls], (id, tvls) => tvls[id]) ?? 0)

export const ChainSwitcher = ({ supportedNetworks, currentMenu }: ChainSwitcherProps) => {
  const blockchainId = getCurrentNetwork(usePathname())

  const [isOpen, , close, toggle] = useSwitch()
  const [isSettingsOpen, openSettings, closeSettings] = useSwitch()
  const [showTestnets, setShowTestnets] = useShowTestNets()
  useEffect(() => () => close(), [blockchainId, close]) // close on chain change
  const tvls = useNetworksTVL(TVL_SOURCES[currentMenu])

  const options = useMemo(
    () =>
      lodash.orderBy(
        Object.values(supportedNetworks).filter(networkConfig => networkConfig.showInSelectNetwork),
        [getTvl(tvls.data), 'name'],
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
        {blockchainId && <ChainSwitcherIcon blockchainId={blockchainId} />}
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
            <ChainList showTestnets={showTestnets} options={options} tvls={tvls} selectedNetworkId={blockchainId} />
          )}
        </ModalDialog>
      )}
    </>
  )
}
