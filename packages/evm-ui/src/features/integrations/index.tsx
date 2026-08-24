import { useState } from 'react'
import { useParams } from '@evm-ui/hooks/router'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import { useSwitch } from '@evm-ui/hooks/useSwitch'
import { t, Trans } from '@evm-ui/lib/i18n'
import { LegacyTableSearchField } from '@evm-ui/shared/ui/DataTable/LegacyTableSearchField'
import { InlineLink } from '@evm-ui/shared/ui/InlineLink'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { IntegrationsList } from './components/IntegrationsList'

const { Spacing, Sizing } = SizesAndSpaces

// Update integrations list repo: https://github.com/curvefi/curve-external-integrations
export const Integrations = () => {
  const { network } = useParams<{ network: string }>()

  const [searchText, setSearchText] = useState('')
  const [isSearchExpanded, , , toggleSearchExpanded] = useSwitch(false)
  const isExpandedOrValue = Boolean(isSearchExpanded || searchText)
  const isMobile = useIsMobile()
  const hideTitle = isExpandedOrValue && isMobile

  return (
    <Stack
      data-testid="integrations-page"
      sx={{
        gap: Spacing.sm,
        backgroundColor: t => t.design.Layer[1].Fill,
        marginInline: 'auto',
        marginBlockStart: Spacing.xl,
        paddingBlockEnd: Spacing.lg,
        paddingInline: Spacing.md,
      }}
    >
      <Stack
        direction="row"
        sx={{
          alignItems: 'end',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: Spacing.md,
          minHeight: Sizing.xxl,
          paddingBlockEnd: Spacing.sm,
        }}
      >
        {!hideTitle && <Typography variant="headingSBold">{t`Curve Integrations`}</Typography>}
        <LegacyTableSearchField
          value={searchText}
          placeholder={t`Search by integration name`}
          onChange={setSearchText}
          toggleExpanded={toggleSearchExpanded}
          isExpanded={isExpandedOrValue}
        />
      </Stack>
      <Typography variant="bodySRegular">
        <Trans>
          The following application all allege they are building atop the Curve ecosystem. Please note that no guarantee
          is made as to the authenticity, veracity or safety of any of these protocols. You assume all risks for using
          any links, so please conduct your own research and exercise caution.
          <br />
          If you observe any issues with any link or would like to add to this list, please create a PR in the following
          Github repository{' '}
          <InlineLink to="https://github.com/curvefi/curve-external-integrations">
            https://github.com/curvefi/curve-external-integrations
          </InlineLink>
        </Trans>
      </Typography>
      <IntegrationsList networkId={network} searchText={searchText} />
    </Stack>
  )
}
