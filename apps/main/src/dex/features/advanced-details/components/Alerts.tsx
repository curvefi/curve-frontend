import type { PoolAlert } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Stack from '@mui/material/Stack'
import { useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { InlineLink } from '@ui-kit/shared/ui/InlineLink'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type AlertsProps = {
  poolAlert: PoolAlert | null
  isCryptoPool: boolean
  poolName: string
  tokenAlert: PoolAlert | null
}

const PoolMessageAlert = ({ alert: { alertType, message } }: { alert: PoolAlert }) => (
  <Alert
    variant="filled"
    severity={alertType === 'danger' || alertType === 'error' ? 'error' : alertType === 'warning' ? 'warning' : 'info'}
  >
    {message}
  </Alert>
)

export const Alerts = ({ poolAlert, isCryptoPool, poolName, tokenAlert }: AlertsProps) => (
  <Stack sx={{ gap: Spacing.sm, paddingBlockStart: Spacing.md }}>
    {poolAlert && !poolAlert.isDisableDeposit && !poolAlert.isInformationOnlyAndShowInForm && (
      <PoolMessageAlert alert={poolAlert} />
    )}

    {tokenAlert && tokenAlert.isInformationOnly && <PoolMessageAlert alert={tokenAlert} />}

    {isCryptoPool && (
      <Alert variant="outlined" severity="info">
        <AlertTitle>{t`${poolName} is a Cryptoswap pool`}</AlertTitle>
        {t`Cryptoswap pools contain non pegged assets. Liquidity providers are exposed to all assets in the pools.`}{' '}
        <InlineLink to="https://docs.curve.finance/user/dex/overview" external hideIcon>
          {t`Click here to learn more about Cryptoswap pools`}
        </InlineLink>
      </Alert>
    )}

    <Alert variant="outlined" severity="info">
      <InlineLink to={getPath(useParams(), `/disclaimer`)} external hideIcon>
        {t`Risks of using ${poolName}`}
      </InlineLink>
    </Alert>
  </Stack>
)
