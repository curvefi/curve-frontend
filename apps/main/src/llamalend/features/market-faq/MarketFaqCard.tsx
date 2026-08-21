import { MarketCardHeader } from '@/llamalend/widgets/MarketCardHeader'
import { useNewLlamaMarketDetailPage } from '@evm-ui/hooks/useFeatureFlags'
import { t } from '@evm-ui/lib/i18n'
import { Accordion } from '@evm-ui/shared/ui/Accordion'
import { ExternalLink } from '@evm-ui/shared/ui/ExternalLink'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { borderStyle } from '@evm-ui/utils'
import { EXTERNAL_LINKS } from '@legacy-ui/utils'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FAQ_GROUPS } from './faq-groups'

const { Spacing } = SizesAndSpaces

const FaqContent = () => (
  <Stack sx={{ gap: Spacing.md }}>
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

    <Stack sx={{ alignItems: 'center', gap: Spacing.sm }}>
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
  </Stack>
)

export const MarketFaqCard = () => {
  const Header = useNewLlamaMarketDetailPage() ? MarketCardHeader : CardHeader

  return (
    <Card
      size="small"
      data-testid="llamalend-market-faq"
      sx={{
        '& .MuiCardContent-root': { paddingBlockStart: 0 }, // The FAQ content title handles the block-start padding.
      }}
    >
      <Header title={t`FAQs`} />
      <CardContent component={Stack} sx={{ backgroundColor: theme => theme.design.Layer[1].Fill }}>
        <FaqContent />
      </CardContent>
    </Card>
  )
}
