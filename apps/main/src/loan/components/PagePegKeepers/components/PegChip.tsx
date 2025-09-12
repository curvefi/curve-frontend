import type { PegStatus } from '@/loan/components/PagePegKeepers/components/peg-status.util'
import Chip from '@mui/material/Chip'
import { t } from '@ui-kit/lib/i18n'

const pegChipLabels = {
  loading: '-',
  pegged: t`Pegged`,
  overpegged: t`Over peg`,
  underpegged: t`Under peg`,
} as const satisfies Record<PegStatus['label'], string>

type Props = {
  status: PegStatus
}

/**
 * Displays a chip showing the current peg status with appropriate color coding
 * @param status - PegStatus object containing label and color
 */
export const PegChip = ({ status: { label, color } }: Props) =>
  label !== 'loading' && <Chip label={pegChipLabels[label]} size="small" color={color} />
