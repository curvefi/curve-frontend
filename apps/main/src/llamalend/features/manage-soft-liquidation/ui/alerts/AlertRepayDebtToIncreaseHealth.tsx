import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const AlertRepayDebtToIncreaseHealth = () => (
  <Alert severity="info" variant="outlined" sx={{ boxShadow: 'none' }}>
    <AlertTitle>{t`Repay debt to increase Health`}</AlertTitle>

    <Stack gap={Spacing.sm}>
      <Typography variant="bodySRegular" color="textSecondary">
        {t`Repaying debt will improve health and help maintain a position open.`}
      </Typography>

      <Typography variant="bodySRegular" color="textSecondary">
        {t`While soft liquidation is active, health steadily declines based on market volatility and liquidity in the liquidation cushion.`}

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
