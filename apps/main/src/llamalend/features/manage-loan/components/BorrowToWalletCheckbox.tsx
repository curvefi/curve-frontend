import { type ChangeEvent } from 'react'
import Typography from '@mui/material/Typography'
import { CheckboxField } from '@ui/features/forms/controls/CheckboxField'
import type { QueryOrValue } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

/** Borrows to the wallet instead of through the leverage zap of a leveraged position, explaining it when checked */
export const BorrowToWalletCheckbox = ({
  checked,
  onChange,
}: {
  checked: QueryOrValue<boolean>
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}) => (
  <CheckboxField
    checked={checked}
    label={t`Borrow to wallet`}
    testIdPrefix="borrow-to-wallet"
    onChange={onChange}
    collapsible={
      <Typography variant="bodyXsRegular" color="textSecondary">
        {t`Borrowed assets will go to your wallet, this will impact your position parameters.`}
      </Typography>
    }
  />
)
