import { type ChangeEvent } from 'react'
import Typography from '@mui/material/Typography'
import { CheckboxField } from '@ui/features/forms/controls/CheckboxField'
import type { QueryOrValue } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { Sizing, Spacing } = SizesAndSpaces

/** Lines the description up with the label: the width of the small checkbox and its end padding */
const labelIndent = {
  mobile: `calc(${Sizing.xs.mobile} + ${Spacing.xs.mobile})`,
  tablet: `calc(${Sizing.xs.tablet} + ${Spacing.xs.tablet})`,
  desktop: `calc(${Sizing.xs.desktop} + ${Spacing.xs.desktop})`,
}

/** Borrows to the wallet instead of through the leverage zap of a leveraged position, explaining it when checked */
export const BorrowToWalletCheckbox = ({
  checked,
  onChange,
}: {
  checked: QueryOrValue<boolean | undefined>
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}) => (
  <CheckboxField
    checked={checked}
    label={t`Borrow to wallet`}
    testIdPrefix="borrow-to-wallet"
    onChange={onChange}
    collapsible={
      <Typography variant="bodyXsRegular" color="textSecondary" sx={{ paddingInlineStart: labelIndent }}>
        {t`Borrowed assets will go to your wallet, this will impact your position parameters.`}
      </Typography>
    }
  />
)
