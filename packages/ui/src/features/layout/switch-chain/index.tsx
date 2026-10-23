import lodash from 'lodash'
import { useEffect } from 'react'
import Badge from '@mui/material/Badge'
import IconButton from '@mui/material/IconButton'
import { maybe } from '@primitives/objects.utils'
import { ModalDialog } from '@ui/components/ModalDialog'
import { ModalSettingsButton } from '@ui/components/ModalSettingsButton'
import type { QueryProp } from '@ui/features/queries/util'
import { useShowTestNets } from '@ui/features/storage/useLocalStorage'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { showToast } from '@ui/features/toast/Toast/toast.util'
import { useSwitch } from '@ui/hooks/useSwitch'
import { ArrowLeft } from '@ui/icons/ArrowLeft'
import { LockClosedIcon } from '@ui/icons/LockClosedIcon'
import { t } from '@ui/lib/i18n'
import { ChainList, type ChainListOption } from './ChainList'
import { ChainSettings } from './ChainSettings'
import { ChainSwitcherIcon } from './ChainSwitcherIcon'
import type { NetworkSwitchPolicy } from './util'

const { IconSize } = SizesAndSpaces

export type ChainSwitcherProps = {
  networkSwitch: NetworkSwitchPolicy
  supportedNetworks: ChainListOption[]
  currentNetwork: ChainListOption | undefined
  tvls: QueryProp<Record<string, number>>
}

const getTvl =
  (tvls: Record<string, number> | undefined) =>
  ({ blockchainId: id, isLite, isTestnet }: ChainListOption) =>
    isTestnet || isLite
      ? 0 // ignore lite chains tvl, it's only available for downgraded chains and messes with sorting
      : (maybe(tvls, tvls => tvls[id]) ?? 0)

export const ChainSwitcher = ({ networkSwitch, supportedNetworks, currentNetwork, tvls }: ChainSwitcherProps) => {
  const blockchainId = currentNetwork?.blockchainId
  const [isOpen, , close, toggle] = useSwitch()
  const [isSettingsOpen, openSettings, closeSettings] = useSwitch()
  const [showTestnets, setShowTestnets] = useShowTestNets()

  const isLocked = networkSwitch.type === 'locked'
  const onClick = isLocked
    ? () =>
        showToast({
          title: networkSwitch.toastTitle?.() ?? t`Network switching unavailable`,
          severity: 'warning',
          testId: 'alert-eth-only',
        })
    : toggle

  useEffect(
    () => () => {
      close()
      closeSettings()
    },
    [blockchainId, networkSwitch.type, close, closeSettings],
  )

  return (
    <>
      <IconButton size="small" onClick={onClick} data-testid="btn-change-chain" title={currentNetwork?.name}>
        {blockchainId && (
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            invisible={!isLocked}
            badgeContent={<LockClosedIcon data-testid="network-lock" />}
            // We haven't standardized MUI's badge yet, so we're manually setting color and sizes in this specific case.
            sx={{
              '& .MuiBadge-badge': {
                backgroundColor: 'background.paper',
                color: 'text.secondary',
                width: IconSize.sm,
                height: IconSize.sm,
                '& svg': { width: IconSize.xs, height: IconSize.xs },
              },
            }}
          >
            <ChainSwitcherIcon blockchainId={blockchainId} />
          </Badge>
        )}
      </IconButton>
      {isOpen != null && (
        <ModalDialog
          open={isOpen}
          onClose={close}
          title={isSettingsOpen ? t`Select Network Settings` : t`Select Network`}
          titleAction={
            isSettingsOpen && (
              <IconButton onClick={closeSettings} size="extraSmall">
                <ArrowLeft />
              </IconButton>
            )
          }
          footer={!isSettingsOpen && <ModalSettingsButton onClick={openSettings} />}
        >
          {isSettingsOpen ? (
            <ChainSettings showTestnets={showTestnets} setShowTestnets={setShowTestnets} />
          ) : (
            <ChainList
              showTestnets={showTestnets}
              options={lodash.orderBy(supportedNetworks, [getTvl(tvls.data), 'name'], ['desc', 'asc'])}
              tvls={tvls}
              selectedNetworkId={blockchainId}
              onNetwork={close}
            />
          )}
        </ModalDialog>
      )}
    </>
  )
}
