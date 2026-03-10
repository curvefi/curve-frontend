import { useCallback } from 'react'
import { ArrowRight } from '@mui/icons-material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import Box from '@mui/material/Box'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { NetworkDef } from '@ui/utils'
import { ChainList } from '@ui-kit/features/switch-chain/ui/ChainList'
import { ChainSwitcherIcon } from '@ui-kit/features/switch-chain/ui/ChainSwitcherIcon'
import { usePathname } from '@ui-kit/hooks/router'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { getCurrentNetwork } from '@ui-kit/shared/routes'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { Spinner } from '@ui-kit/shared/ui/Spinner'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Chain, requireBlockchainId, type SxProps } from '@ui-kit/utils'

const { Spacing } = SizesAndSpaces

/** CSS grid template area names */
const GRID_AREAS = {
  from: {
    label: 'from-label',
    input: 'from-input',
  },
  arrow: 'arrow',
  to: {
    label: 'to-label',
    input: 'to-input',
  },
}

/** Small label rendered above a network selector (e.g. "From" / "To"). */
const SelectNetworkLabel = ({ label, sx }: { label: string; sx?: SxProps }) => (
  <Typography variant="bodyXsRegular" color="textTertiary" sx={sx}>
    {label}
  </Typography>
)

/** Displays a chain icon and its human-readable name for the given {@link blockchainId}. */
const SelectNetworkValue = ({ blockchainId, sx }: { blockchainId: string; sx?: SxProps }) => (
  <Stack direction="row" alignItems="center" gap={Spacing.sm} sx={sx}>
    <ChainSwitcherIcon networkId={blockchainId} size={20} />
    <Typography variant="bodyMBold" textTransform="capitalize">
      {blockchainId}
    </Typography>
  </Stack>
)

/**
 * Dropdown-style button that shows the currently selected network.
 * Opens an external modal on click rather than a native dropdown menu.
 * We use this same pattern for some other components like the TokenSelector.
 * We ought to refactor this some time as it's becoming quite common.
 */
const SelectNetworkButton = ({
  chainId,
  loading = false,
  disabled = false,
  onClick,
  sx,
}: {
  chainId: number | undefined
  loading?: boolean
  disabled?: boolean
  onClick: () => void
  sx?: SxProps
}) => (
  <Select
    value=""
    onClick={disabled || loading ? undefined : onClick}
    open={false}
    disabled={disabled || loading}
    displayEmpty
    size="medium"
    renderValue={() =>
      loading || !chainId ? (
        <Spinner useTheme={true} />
      ) : (
        <SelectNetworkValue blockchainId={requireBlockchainId(chainId)} />
      )
    }
    IconComponent={KeyboardArrowDownIcon}
    sx={sx}
  />
)

export type BridgeTargetsProps = {
  /** List of networks available as bridge sources. */
  networks: NetworkDef[]
  /** Currently selected source chain id. At the moment of writing the parent component reads this from the URL. */
  fromChainId: number | undefined
  disabled: boolean
  loading: boolean
  /** Callback invoked when the user picks a new source network. Not really used in prod, as the ChainList component itself will update the URL. */
  onNetworkSelected?: (network: NetworkDef) => void
}

/**
 * Source / destination network selector for the bridge.
 *
 * The source ("From") network is user-selectable via a modal chain list,
 * while the destination ("To") is fixed to Ethereum mainnet. Perhaps later
 * we can support bridging to different networks.
 */
export const BridgeTargets = ({ networks, fromChainId, disabled, loading, onNetworkSelected }: BridgeTargetsProps) => {
  const [isFromOpen, openFrom, closeFrom] = useSwitch(false)

  return (
    <Box
      // Stack doesn't work because of the arrow icon alignment, and MUI's grid is to constraint wrt sizes, hence native grid.
      sx={{
        display: 'grid',
        gridTemplateRows: 'auto auto',
        gridTemplateColumns: '1fr auto 1fr',
        gridTemplateAreas: `
          '${GRID_AREAS.from.label} . ${GRID_AREAS.to.label}'
          '${GRID_AREAS.from.input} ${GRID_AREAS.arrow} ${GRID_AREAS.to.input}'`,
      }}
    >
      <SelectNetworkLabel label={t`From`} sx={{ gridArea: GRID_AREAS.from.label }} />
      <SelectNetworkButton
        disabled={disabled}
        chainId={fromChainId}
        onClick={openFrom}
        loading={loading}
        sx={{ gridArea: GRID_AREAS.from.input }}
      />

      <ModalDialog open={isFromOpen} onClose={closeFrom} title={t`Select Network`}>
        {/** At the moment of writing, when selecting a network from the chain list feature it updates the URL */}
        <ChainList
          showTestnets={false}
          options={networks}
          selectedNetworkId={getCurrentNetwork(usePathname())}
          onNetwork={useCallback(
            (network: NetworkDef) => {
              closeFrom()
              onNetworkSelected?.(network)
            },
            [closeFrom, onNetworkSelected],
          )}
        />
      </ModalDialog>

      <Box sx={{ gridArea: GRID_AREAS.arrow, display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
        <ArrowRight />
      </Box>

      <SelectNetworkLabel label={t`To`} sx={{ gridArea: GRID_AREAS.to.label }} />
      <SelectNetworkValue blockchainId={requireBlockchainId(Chain.Ethereum)} sx={{ gridArea: GRID_AREAS.to.input }} />
    </Box>
  )
}
