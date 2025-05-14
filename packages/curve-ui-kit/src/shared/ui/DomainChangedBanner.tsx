import { Stack, Typography } from '@mui/material'
import AlertTitle from '@mui/material/AlertTitle'
import Link from '@mui/material/Link'
import { t } from '@ui-kit/lib/i18n'
import { ExclamationTriangleIcon } from '@ui-kit/shared/icons/ExclamationTriangleIcon'
import { Banner } from '@ui-kit/shared/ui/Banner'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const DomainChangedBanner = ({ onDismiss, color }: { onDismiss: () => void; color: string }) => (
  <Banner
    severity="warning"
    onClick={onDismiss}
    color={color}
    learnMoreUrl="https://x.com/CurveFinance/status/1922210827362349546"
  >
    <Stack direction="row" alignItems="end" gap={Spacing.xxs}>
      <ExclamationTriangleIcon />
      <AlertTitle>{t`Domain Change`}</AlertTitle>
    </Stack>
    <Typography variant="bodySRegular" sx={{ textTransform: 'none' }}>
      {t`Curve Finance has moved to a new domain`}
      {': '}
      <Link href="https://curve.finance" target="_blank" color={color}>
        {t`curve.finance`}
      </Link>
      {'. '}
      {t`Always make sure you are on the right domain.`} {t`Read the announcement `}
      <Link href="https://x.com/CurveFinance/status/1922210827362349546" target="_blank" color={color}>
        {t`tweet`}
      </Link>
      .
    </Typography>
  </Banner>
)
