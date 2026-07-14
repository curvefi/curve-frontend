import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Typography from '@mui/material/Typography'
import type { Decimal } from '@primitives/decimal.utils'
import { t, Trans } from '@ui-kit/lib/i18n'
import { InlineLink } from '@ui-kit/shared/ui/InlineLink'
import { formatTokenCompact } from '@ui-kit/utils'
import { useCrvSwapUrl } from '../../hooks/useCrvSwapUrl'

type Props = {
  debtTokenSymbol: string | undefined // this can be undefined if the userState query failed or is pending
  missing: Decimal
  balance: Decimal
}

export const AlertAdditionalDebtToken = ({ missing, debtTokenSymbol: debtToken = t`debt tokens`, balance }: Props) => {
  const crvSwapUrl = useCrvSwapUrl()

  return (
    <Alert severity="error" variant="outlined">
      <AlertTitle>{t`Additional ${debtToken} required`}</AlertTitle>

      <Typography variant="bodySRegular" color="textSecondary">
        <Trans>
          You currently hold <strong>{formatTokenCompact(balance, debtToken)}</strong> and need an extra{' '}
          <strong>{formatTokenCompact(missing, debtToken)}</strong> to close the position.{' '}
          {debtToken === 'crvUSD' && <InlineLink to={crvSwapUrl} external hideIcon>{t`Get crvUSD here.`}</InlineLink>}
        </Trans>
      </Typography>
    </Alert>
  )
}
