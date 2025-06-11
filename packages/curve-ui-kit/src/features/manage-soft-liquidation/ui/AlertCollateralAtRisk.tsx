import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import LinkMui from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { ArrowTopRightIcon } from '@ui-kit/shared/icons/ArrowTopRightIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, IconSize } = SizesAndSpaces

export const AlertCollateralAtRisk = () => (
  <Alert severity="error" variant="outlined" sx={{ boxShadow: 'none' }}>
    <AlertTitle>{t`Your collateral is at risk.`}</AlertTitle>

    <Stack gap={Spacing.sm}>
      <Typography variant="bodySRegular" color="textSecondary">
        {t`The collateral price has moved below the liquidation threshold and soft-liquidation has started.`}
      </Typography>

      <Typography variant="bodySRegular" color="textSecondary">
        {t`While soft liquidation is active, you only repay debt to increase health or withdraw collateral.`}
      </Typography>

      <Stack display="inline-flex">
        <Button variant="inline" color="ghost" size="extraSmall">
          {t`The position will be fully liquidated if health reaches 0`}
          {/** Had to make the comma part of the button to prevent awkward wrapping */}
          <Typography variant="bodySRegular" color="textSecondary">
            ,
          </Typography>
        </Button>

        <Typography variant="bodySRegular" color="textSecondary">
          {t`and all collateral lost.`}
        </Typography>
      </Stack>

      <Button
        component={LinkMui}
        href="https://todo.todo"
        target="_blank"
        color="ghost"
        variant="link"
        endIcon={<ArrowTopRightIcon sx={{ width: IconSize.md, height: IconSize.md }} />}
        size="extraSmall"
        sx={{ justifyContent: 'end', '.MuiButton-endIcon': { marginRight: 0 } }}
      >
        {t`What are soft liquidations?`}
      </Button>
    </Stack>
  </Alert>
)
