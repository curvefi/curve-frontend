import { MarketCardHeader } from '@/llamalend/widgets/MarketCardHeader'
import { useNewLlamaMarketDetailPage } from '@evm-ui/hooks/useFeatureFlags'
import { Accordion } from '@evm-ui/shared/ui/Accordion'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { ExternalLink } from '@ui/components/ExternalLink'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { EXTERNAL_LINKS } from '@ui/lib/resource.constants'
import { FAQ_GROUPS } from './faq-groups'

const { Spacing } = SizesAndSpaces

const FaqContent = () => (
  <Stack>
    {FAQ_GROUPS.map(group => (
      <Card key={group.title} size="inline">
        <CardHeader title={group.title} />
        <CardContent sx={{ marginBlock: Spacing.sm }}>
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
        </CardContent>
      </Card>
    ))}

    <Stack sx={{ alignItems: 'center', gap: Spacing.sm }}>
      <ExternalLink
        href={EXTERNAL_LINKS.docs.user.llamalend.overview}
        label={t`Go to knowledge base`}
        variant="outlined"
        size="small"
        color="secondary"
      />
    </Stack>
  </Stack>
)

export const MarketFaqCard = () => {
  const Header = useNewLlamaMarketDetailPage() ? MarketCardHeader : CardHeader

  return (
    <Card size="small" data-testid="llamalend-market-faq">
      <Header title={t`FAQs`} />
      <CardContent>
        <FaqContent />
      </CardContent>
    </Card>
  )
}
