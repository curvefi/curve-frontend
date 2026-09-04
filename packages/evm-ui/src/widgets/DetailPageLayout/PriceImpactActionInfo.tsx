import { ActionInfo, type ActionInfoProps } from '@evm-ui/shared/ui/ActionInfo'
import type { Theme } from '@mui/material/styles'
import type { Decimal } from '@primitives/decimal.utils'
import type { QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { ExclamationTriangleIcon } from '@ui/icons/ExclamationTriangleIcon'
import { t } from '@ui/lib/i18n'
import { getPriceImpactLevel, type PriceImpact, type PriceImpactLevel } from './price-impact.util'

const { IconSize } = SizesAndSpaces

const getIconColor = (theme: Theme, level: PriceImpactLevel) =>
  ({
    caution: theme.design.Text.TextColors.Feedback.Caution,
    warning: theme.design.Text.TextColors.Feedback.Warning,
    error: theme.design.Text.TextColors.Feedback.Error,
  })[level]

export type PriceImpactActionInfoProps = Omit<ActionInfoProps, 'label' | 'valueColor' | 'valueLeft'> & {
  priceImpact: QueryProp<PriceImpact | Decimal | null>
}

/** Displays price impact with graduated emphasis. */
export const PriceImpactActionInfo = ({ priceImpact, ...props }: PriceImpactActionInfoProps) => {
  const level = getPriceImpactLevel(priceImpact.data)

  return (
    <ActionInfo
      {...props}
      label={t`Price impact`}
      valueColor={level ?? undefined}
      valueLeft={
        level && (
          <ExclamationTriangleIcon
            titleAccess={t`Elevated price impact`}
            sx={{
              color: theme => getIconColor(theme, level),
              width: IconSize.xs,
              height: IconSize.xs,
            }}
          />
        )
      }
    />
  )
}
