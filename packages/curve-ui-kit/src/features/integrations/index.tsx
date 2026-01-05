import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t, Trans } from '@ui-kit/lib/i18n'
import { InlineLink } from '@ui-kit/shared/ui/InlineLink'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { IntegrationsList, type IntegrationsListProps } from './components/IntegrationsList'

const { Spacing } = SizesAndSpaces

// Update integrations list repo: https://github.com/curvefi/curve-external-integrations
export const Integrations = (listProps: IntegrationsListProps) => (
  <Stack
    data-testid="integrations-page"
    gap={Spacing.md}
    sx={{
      backgroundColor: (t) => t.design.Layer[1].Fill,
      marginInline: 'auto',
      marginBlockStart: Spacing.xl,
      marginBlockEnd: Spacing.xxl,
      padding: Spacing.xl,
    }}
  >
    <Typography variant="headingMBold">{t`Curve Integrations`}</Typography>
    <Typography variant="bodyMRegular">
      <Trans>
        The following application all allege they are building atop the Curve ecosystem. Please note that no guarantee
        is made as to the authenticity, veracity or safety of any of these protocols. You assume all risks for using any
        links, so please conduct your own research and exercise caution. If you observe any issues with any link or
        would like to add to this list, please create a PR in the following Github repository{' '}
        <InlineLink to="https://github.com/curvefi/curve-external-integrations">
          https://github.com/curvefi/curve-external-integrations
        </InlineLink>
      </Trans>
    </Typography>

    <IntegrationsList {...listProps} />
  </Stack>
)
