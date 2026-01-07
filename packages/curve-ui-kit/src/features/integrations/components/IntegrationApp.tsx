import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CURVE_ASSETS_URL } from '@ui/utils'
import { ChainIcon } from '@ui-kit/shared/icons/ChainIcon'
import { InlineLink } from '@ui-kit/shared/ui/InlineLink'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { Integration, IntegrationsTags } from '../types'
import { IntegrationAppTag } from './IntegrationAppTag'

const { Spacing, IconSize } = SizesAndSpaces

export const IntegrationApp = ({
  appUrl,
  description,
  imageId,
  networks,
  name,
  tags,
  twitterUrl,
  integrationsTags,
}: Integration & {
  integrationsTags: IntegrationsTags
}) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ height: '100%', backgroundColor: (t) => t.design.Layer[2].Fill }}>
      <Grid height="100%" container columnSpacing={Spacing.md}>
        <Grid size={2}>
          {imageId && (
            <Box
              component="img"
              src={`${CURVE_ASSETS_URL}/platforms/${imageId}`}
              sx={{ height: IconSize.xxl, width: IconSize.xxl }}
            />
          )}
        </Grid>

        <Grid height="100%" size={10}>
          <Stack height="100%" gap={Spacing.xl} justifyContent="space-between">
            <Stack gap={Spacing.md}>
              <Typography variant="headingSBold">{name}</Typography>
              <Typography variant="bodyMRegular">{description}</Typography>

              <Grid container>
                <Grid size={6}>
                  <Stack gap={Spacing.sm}>
                    {Object.keys(tags).map((k) => (
                      <Typography key={k} variant="bodySRegular">
                        <IntegrationAppTag tag={integrationsTags[k] ?? {}} />
                      </Typography>
                    ))}
                  </Stack>
                </Grid>
                <Grid size={6}>
                  <Stack direction="row-reverse" flexWrap="wrap" gap={Spacing.xs}>
                    {Object.keys(networks).map((networkId) => (
                      <ChainIcon key={networkId} blockchainId={networkId} size="sm" />
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </Stack>

            {/** Could be replaced with icon buttons if somebody's feeling cute */}
            <Stack direction="row" gap={Spacing.md}>
              {appUrl && <InlineLink to={appUrl}>App</InlineLink>}
              {twitterUrl && <InlineLink to={twitterUrl}>Twitter</InlineLink>}
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
)
