import { useState } from 'react'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useParams } from '@ui-kit/hooks/router'
import { useIsMobile } from '@ui-kit/hooks/useBreakpoints'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t, Trans } from '@ui-kit/lib/i18n'
import { TableSearchField } from '@ui-kit/shared/ui/DataTable/TableSearchField'
import { InlineLink } from '@ui-kit/shared/ui/InlineLink'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
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
      gap={Spacing.sm}
      sx={{
        backgroundColor: (t) => t.design.Layer[1].Fill,
        marginInline: 'auto',
        marginBlockStart: Spacing.xl,
        paddingBlockEnd: Spacing.lg,
        paddingInline: Spacing.md,
      }}
    >
      <Stack
        direction="row"
        alignItems="end"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={Spacing.md}
        minHeight={Sizing.xxl}
        paddingBlockEnd={Spacing.sm}
      >
        {!hideTitle && <Typography variant="headingSBold">{t`Curve Integrations`}</Typography>}
        <TableSearchField
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
