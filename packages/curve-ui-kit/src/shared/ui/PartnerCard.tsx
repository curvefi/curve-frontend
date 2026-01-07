import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CURVE_ASSETS_URL } from '@ui/utils'
import { ChainIcon } from '@ui-kit/shared/icons/ChainIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { GlobeIcon } from '../icons/GlobeIcon'
import { XIcon } from '../icons/XIcon'

const { Spacing, IconSize } = SizesAndSpaces

const LinkProps = {
  component: Link,
  target: '_blank',
  rel: 'noopener noreferrer',
  size: 'extraSmall',
} as const

/** Represents a partner organization or project displayed in the partner card component. */
export type Partner = {
  /** The display name of the partner */
  name: string
  /** A brief description of the partner and their services */
  description?: string
  /** Optional identifier for the partner's logo/image */
  imageId?: string | null
  /**
   * A map of network names to boolean values indicating which networks the partner supports
   * Format isn't a simple array for compatibility with older external integration lists
   */
  networks?: { [network: string]: boolean }
  /** Optional array of tags/categories associated with the partner */
  tags?: string[]
  /** Optional URL to the partner's application or website */
  appUrl?: string
  /** Optional URL to the partner's Twitter/X profile, named 'twitterUrl' for backwards compatibility */
  twitterUrl?: string
}

export const PartnerCard = ({ name, description, imageId, networks, tags, appUrl, twitterUrl }: Partner) => (
  <Card sx={{ display: 'flex', height: '100%' }}>
    <CardContent sx={{ display: 'flex', flexGrow: 1, backgroundColor: (t) => t.design.Layer[2].Fill }}>
      <Stack flexGrow={1} gap={Spacing.md}>
        <Stack direction="row" gap={Spacing.md}>
          {imageId && (
            <Box
              component="img"
              src={`${CURVE_ASSETS_URL}/${imageId}`}
              sx={{ height: IconSize.xxl, width: IconSize.xxl }}
            />
          )}
          <Stack justifyContent="center">
            <Typography variant="headingSBold">{name}</Typography>

            {networks && Object.values(networks).some((x) => x) && (
              <Stack flexGrow={1} direction="row" gap={Spacing.xs} alignItems="center">
                {Object.entries(networks)
                  .filter(([, enabled]) => enabled)
                  .map(([networkId]) => (
                    <ChainIcon key={networkId} blockchainId={networkId} size="sm" />
                  ))}
              </Stack>
            )}
          </Stack>
        </Stack>

        {description && (
          <Typography flexGrow={1} variant="bodyMRegular">
            {description}
          </Typography>
        )}

        {/** Could be replaced with icon buttons if somebody's feeling cute */}
        <Stack direction="row" gap={Spacing.sm} justifyContent="space-between">
          <Stack direction="row" gap={Spacing.sm} alignItems="center">
            {appUrl && (
              <IconButton {...LinkProps} href={appUrl}>
                <GlobeIcon />
              </IconButton>
            )}
            {twitterUrl && (
              <IconButton {...LinkProps} href={twitterUrl}>
                <XIcon />
              </IconButton>
            )}
          </Stack>

          {tags?.length && (
            <Stack direction="row" gap={Spacing.sm} alignItems="center">
              {tags.map((tag) => (
                <Chip key={tag} label={tag} color="highlight" />
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    </CardContent>
  </Card>
)
