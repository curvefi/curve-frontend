import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { Accordion } from '@ui-kit/shared/ui/Accordion'
import { ExternalLink } from '@ui-kit/shared/ui/ExternalLink'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { FAQ_GROUPS } from './faq-groups'

const { Spacing } = SizesAndSpaces

export const MarketFaq = () => (
  <Stack component="section" gap={0} data-testid="llamalend-market-faq">
    <Stack paddingBlockStart={Spacing.lg} paddingBlockEnd={Spacing.xs}>
      <Typography color="textSecondary" variant="headingSBold">
        {t`FAQs`}
      </Typography>
    </Stack>

    <Stack>
      {FAQ_GROUPS.map(group => (
        <Stack key={group.title} gap={Spacing.xs}>
          <Stack
            paddingBlockStart={Spacing.md}
            paddingBlockEnd={Spacing.xs}
            sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <Typography color="textSecondary" variant="headingXsBold">
              {group.title}
            </Typography>
          </Stack>

          <Stack gap={Spacing.xs} paddingInlineStart={Spacing.md}>
            {group.items.map(item => (
              <Accordion
                key={item.question}
                title={item.question}
                ghost
                indicator="plusMinus"
                sx={{ paddingBlock: Spacing.md }}
              >
                <Typography>{item.answer}</Typography>
              </Accordion>
            ))}
          </Stack>
        </Stack>
      ))}
    </Stack>

    <Stack alignItems="center" gap={Spacing.sm} paddingBlock={Spacing.md}>
      <Typography color="textPrimary" textAlign="center" variant="bodyMRegular">
        {t`Want to know even more?`}
      </Typography>
      <ExternalLink
        href="https://docs.curve.finance/user/llamalend/overview"
        label={t`Go to knowledge base`}
        variant="outlined"
        color="secondary"
      />
    </Stack>
  </Stack>
)
