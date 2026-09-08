import lodash from 'lodash'
import { useEffect, useMemo } from 'react'
import { ModalSettingsButton } from '@evm-ui/shared/ui/ModalSettingsButton'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import IconButton from '@mui/material/IconButton'
import { maybe, type PartialRecord } from '@primitives/objects.utils'
import { ModalDialog } from '@ui/components/ModalDialog'
import type { QueryProp } from '@ui/features/queries/util'
import { useShowTestNets } from '@ui/features/storage/useLocalStorage'
import { showToast } from '@ui/features/toast/Toast/toast.util'
import { useSwitch } from '@ui/hooks/useSwitch'
import { t } from '@ui/lib/i18n'
import { ChainList, type ChainListOption } from './ChainList'
import { ChainSettings } from './ChainSettings'
import { ChainSwitcherIcon } from './ChainSwitcherIcon'

export type ChainSwitcherProps<TApp extends string> = {
  supportedNetworks: ChainListOption[]
  currentMenu: TApp
  currentNetwork: ChainListOption | undefined
  hideChains: PartialRecord<TApp, number[]>
  tvls: QueryProp<Record<string, number>>
}

const getTvl =
  (tvls: Record<string, number> | undefined) =>
  ({ blockchainId: id, isLite, isTestnet }: ChainListOption) =>
    isTestnet || isLite
      ? 0 // ignore lite chains tvl, it's only available for downgraded chains and messes with sorting
      : (maybe(tvls, tvls => tvls[id]) ?? 0)

export const ChainSwitcher = <TApp extends string>({
  supportedNetworks,
  currentMenu,
  currentNetwork,
  tvls,
  hideChains,
}: ChainSwitcherProps<TApp>) => {
  const blockchainId = currentNetwork?.blockchainId
  const [isOpen, , close, toggle] = useSwitch()
  const [isSettingsOpen, openSettings, closeSettings] = useSwitch()
  const [showTestnets, setShowTestnets] = useShowTestNets()
  useEffect(() => () => close(), [blockchainId, close]) // close on chain change

  const options: ChainListOption[] = useMemo(
    () =>
      lodash.orderBy(
        supportedNetworks.filter(n => !hideChains[currentMenu]?.includes(n.chainId)),
        [getTvl(tvls.data), 'name'],
        ['desc', 'asc'],
      ),
    [currentMenu, hideChains, supportedNetworks, tvls.data],
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
