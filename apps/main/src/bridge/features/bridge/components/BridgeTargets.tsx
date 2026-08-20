import { ArrowRight } from '@mui/icons-material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { NetworkDef } from '@ui/utils'
import { useNetworksTVL } from '@ui-kit/entities/prices-networks.query'
import { ChainList } from '@ui-kit/features/switch-chain/ui/ChainList'
import { ChainSwitcherIcon } from '@ui-kit/features/switch-chain/ui/ChainSwitcherIcon'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ModalDialog } from '@ui-kit/shared/ui/ModalDialog'
import { Select } from '@ui-kit/shared/ui/Select'
import { Spinner } from '@ui-kit/shared/ui/Spinner'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { applySxProps, type SxProps } from '@ui-kit/utils'

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
  <Stack direction="row" sx={applySxProps({ alignItems: 'center', gap: Spacing.sm }, sx)}>
    <ChainSwitcherIcon networkId={blockchainId} size={20} />
    <Typography variant="bodyMBold" sx={{ textTransform: 'capitalize' }}>
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
  networkId,
  loading,
  onClick,
  testId,
  sx,
}: {
  networkId: string | undefined
  loading: boolean
  onClick: () => void
  testId: string
  sx?: SxProps
}) => (
  <Select
    value=""
    onClick={loading ? undefined : onClick}
    open={false}
    disabled={loading}
    displayEmpty
    data-testid={testId}
    size="medium"
    renderValue={() =>
      loading || !networkId ? <Spinner useTheme={true} /> : <SelectNetworkValue blockchainId={networkId} />
    }
    IconComponent={KeyboardArrowDownIcon}
    sx={sx}
  />
)

export type BridgeTargetsProps = {
  /** List of networks available as bridge sources. */
  networks: NetworkDef[]
  /** Currently selected source chain id. */
  fromChainId: number
  loading: boolean
  /** Callback invoked when the user picks a new source network. */
  onNetworkSelected: (network: NetworkDef) => void
  toChainId: number
  destinationNetworks: NetworkDef[]
  onDestinationSelected: (network: NetworkDef) => void
  onSwapNetworks?: () => void
}

/**
 * Source / destination network selector for the bridge.
 *
 * Both networks are selected through modal chain lists. Navigation and route
 * state remain owned by the parent bridge form.
 */
export const BridgeTargets = ({
  networks,
  fromChainId,
  loading,
  onNetworkSelected,
  toChainId,
  destinationNetworks,
  onDestinationSelected,
  onSwapNetworks,
}: BridgeTargetsProps) => {
  const [isFromOpen, openFrom, closeFrom] = useSwitch(false)
  const [isToOpen, openTo, closeTo] = useSwitch(false)
  const tvls = useNetworksTVL('lending')
  const fromNetworkId = networks.find(({ chainId }) => chainId === fromChainId)?.id
  const toNetworkId = networks.find(({ chainId }) => chainId === toChainId)?.id

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
        networkId={fromNetworkId}
        onClick={openFrom}
        testId="bridge-origin-select"
        loading={loading}
        sx={{ gridArea: GRID_AREAS.from.input }}
      />

      <ModalDialog open={isFromOpen} onClose={closeFrom} title={t`Select origin network`}>
        <ChainList
          showTestnets={false}
          options={networks}
          selectedNetworkId={fromNetworkId}
          tvls={tvls}
          navigateOnSelect={false}
          onNetwork={network => {
            closeFrom()
            onNetworkSelected(network)
          }}
        />
      </ModalDialog>

      <Box sx={{ gridArea: GRID_AREAS.arrow, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <IconButton
          aria-label={t`Reverse bridge direction`}
          data-testid="bridge-swap-networks"
          disabled={loading || !onSwapNetworks}
          onClick={onSwapNetworks}
          size="small"
        >
          <ArrowRight />
        </IconButton>
      </Box>

      <SelectNetworkLabel label={t`To`} sx={{ gridArea: GRID_AREAS.to.label }} />
      <SelectNetworkButton
        networkId={toNetworkId}
        onClick={openTo}
        testId="bridge-destination-select"
        loading={loading}
        sx={{ gridArea: GRID_AREAS.to.input }}
      />
      <ModalDialog open={isToOpen} onClose={closeTo} title={t`Select destination network`}>
        <ChainList
          showTestnets={false}
          options={destinationNetworks}
          selectedNetworkId={toNetworkId}
          tvls={tvls}
          navigateOnSelect={false}
          onNetwork={network => {
            closeTo()
            onDestinationSelected(network)
          }}
        />
      </ModalDialog>
    </Box>
  )
}
