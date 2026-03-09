import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const AlertClosePosition = () => (
  <Alert severity="info" variant="outlined" sx={{ boxShadow: 'none' }}>
    <AlertTitle>{t`Close position`}</AlertTitle>

    <Stack gap={Spacing.sm}>
      <Typography variant="bodySRegular" color="textSecondary">
        {t`Closing position to recover the collateral as it is (crvUSD + collateral).`}
      </Typography>

      <Typography variant="bodySRegular" color="textSecondary">
        {t`While soft liquidation is active, you may only repay debt to increase health or withdraw collateral.`}

        <Button
          href="https://docs.curve.finance/user/llamalend/borrowing"
          target="_blank"
          color="ghost"
          variant="inline"
          size="extraSmall"
        >
          {t` The position will be fully liquidated if health reaches 0`}
        </Button>

        {t`, and all collateral lost.`}
      </Typography>
    </Stack>
  </Alert>
)
