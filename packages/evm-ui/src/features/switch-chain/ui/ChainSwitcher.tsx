import lodash from 'lodash'
import { useEffect, useMemo } from 'react'
import { useShowTestNets } from '@evm-ui/hooks/useLocalStorage'
import { ModalSettingsButton } from '@evm-ui/shared/ui/ModalSettingsButton'
import { showToast } from '@evm-ui/widgets/Toast/toast.util'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import IconButton from '@mui/material/IconButton'
import { maybe, type PartialRecord } from '@primitives/objects.utils'
import { ModalDialog } from '@ui/components/ModalDialog'
import type { QueryProp } from '@ui/features/queries/util'
import { useSwitch } from '@ui/hooks/useSwitch'
import { t } from '@ui/lib/i18n'
import { ChainList, type ChainListOption } from './ChainList'
import { ChainSettings } from './ChainSettings'
import { ChainSwitcherIcon } from './ChainSwitcherIcon'

export type ChainSwitcherProps<TId extends string, TChainId extends number, TMenuApp extends string> = {
  supportedNetworks: ChainListOption<TId, TChainId>[]
  currentMenu: TMenuApp
  currentNetwork: ChainListOption<TId, TChainId> | undefined
  hideChains: PartialRecord<TMenuApp, number[]>
  tvls: QueryProp<Record<string, number>>
}

const getTvl =
  <TId extends string, TChainId extends number>(tvls: Record<TId, number> | undefined) =>
  ({ blockchainId: id, isLite, isTestnet }: ChainListOption<TId, TChainId>) =>
    isTestnet || isLite
      ? 0 // ignore lite chains tvl, it's only available for downgraded chains and messes with sorting
      : (maybe(tvls, tvls => tvls[id]) ?? 0)

export const ChainSwitcher = <TId extends string, TChainId extends number, TMenuApp extends string>({
  supportedNetworks,
  currentMenu,
  currentNetwork,
  tvls,
  hideChains,
}: ChainSwitcherProps<TId, TChainId, TMenuApp>) => {
  const blockchainId = currentNetwork?.blockchainId
  const [isOpen, , close, toggle] = useSwitch()
  const [isSettingsOpen, openSettings, closeSettings] = useSwitch()
  const [showTestnets, setShowTestnets] = useShowTestNets()
  useEffect(() => () => close(), [blockchainId, close]) // close on chain change

  const options: ChainListOption<TId, TChainId>[] = useMemo(
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
            <ChainList<TId, TChainId>
              showTestnets={showTestnets}
              options={options}
              tvls={tvls}
              selectedNetworkId={blockchainId}
            />
          )}
        </ModalDialog>
      )}
    </>
  )
}
