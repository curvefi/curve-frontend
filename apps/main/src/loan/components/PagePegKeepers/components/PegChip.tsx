import type { PegStatus } from '@/loan/components/PagePegKeepers/components/peg-status.util'
import { t } from '@ui-kit/lib/i18n'
import { Badge } from '@ui-kit/shared/ui/Badge'

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
  label !== 'loading' && <Badge label={pegChipLabels[label]} size="small" color={color} />
