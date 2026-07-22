import { MarketCardHeader } from '@/llamalend/widgets/MarketCardHeader'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { EXTERNAL_LINKS } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { Accordion } from '@ui-kit/shared/ui/Accordion'
import { ExternalLink } from '@ui-kit/shared/ui/ExternalLink'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { borderStyle } from '@ui-kit/utils'
import { FAQ_GROUPS } from './faq-groups'

const { Spacing } = SizesAndSpaces

const FaqContent = () => (
  <>
    <Stack>
      {FAQ_GROUPS.map(group => (
        <Stack key={group.title} sx={{ gap: Spacing.xs }}>
          <Typography
            component="h3"
            color="textSecondary"
            variant="bodyMBold"
            sx={{ borderBottom: borderStyle, paddingBlockStart: Spacing.md, paddingBlockEnd: Spacing.xs }}
          >
            {group.title}
          </Typography>

          <Stack sx={{ gap: Spacing.xs, paddingInlineStart: Spacing.md }}>
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

    <Stack sx={{ alignItems: 'center', gap: Spacing.sm, paddingBlock: Spacing.md }}>
      <Typography color="textPrimary" variant="bodyMRegular">
        {t`Want to know even more?`}
      </Typography>

      <ExternalLink
        href={EXTERNAL_LINKS.docs.user.llamalend.overview}
        label={t`Go to knowledge base`}
        variant="outlined"
        color="secondary"
      />
    </Stack>
  </>
)

export const MarketFaq = () => (
  <Stack component="section" data-testid="llamalend-market-faq">
    <Stack sx={{ paddingBlockStart: Spacing.lg, paddingBlockEnd: Spacing.xs }}>
      <Typography component="h2" color="textSecondary" variant="headingSBold">
        {t`Frequently Asked Questions`}
      </Typography>
    </Stack>
    <FaqContent />
  </Stack>
)

export const MarketFaqCard = () => (
  <Card data-testid="llamalend-market-faq">
    <MarketCardHeader title={t`FAQs`} />
    <CardContent component={Stack} sx={{ backgroundColor: theme => theme.design.Layer[1].Fill }}>
      <FaqContent />
    </CardContent>
  </Card>
)
