import { GasIcon } from '@ui-kit/shared/icons/FireIcon'
import { type ActionInfoProps, ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatValue } from './util'

const { IconSize } = SizesAndSpaces

export type Props = { eth: number; gwei: number; dollars: number } & Partial<ActionInfoProps>

/** Transaction cost breakdown in ETH, GWEI, and USD */
export const EstimatedTxCost = ({ eth, gwei, dollars, ...actionInfoProps }: Props) => (
  <ActionInfo
    label="Estimated tx cost"
    valueLeft={<GasIcon sx={{ width: IconSize.md, height: IconSize.md }} />}
    value={`$${formatValue(dollars)}`}
    valueTooltip={`${eth} ETH at ${gwei} GWEI`}
    {...actionInfoProps}
  />
)
