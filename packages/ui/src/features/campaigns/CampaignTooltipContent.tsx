import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatDate } from '@primitives/date.utils'
import { formatNumber } from '@primitives/number.utils'
import { TooltipDescription, TooltipFooter, TooltipValueLink, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'
import type { CampaignRewards } from './types'

export const CampaignTooltipContent = ({ campaign, showRate }: { campaign: CampaignRewards; showRate: boolean }) => (
  <TooltipWrapper>
    {showRate && campaign.reward?.type === 'apr' && (
      <Typography variant="bodySRegular" sx={{ textAlign: 'start' }}>
        {t`APR`}: {formatNumber(campaign.reward.value, 'percent.rate')}
      </Typography>
    )}
    <Stack>
      <Typography variant="bodySBold">{campaign.campaignName || campaign.platform}</Typography>
      {campaign.campaignName && campaign.platform && <TooltipDescription text={t`by ${campaign.platform}`} />}
    </Stack>
    {campaign.period && (
      <Stack>
        <TooltipDescription text={t`from: ${formatDate(campaign.period[0])}`} />
        <TooltipDescription text={t`to: ${formatDate(campaign.period[1])}`} />
      </Stack>
    )}
    <TooltipDescription
      text={
        campaign.action === 'supply'
          ? t`Earn ${campaign.symbol ?? '?'} by supplying liquidity.`
          : campaign.action === 'borrow'
            ? t`Earn ${campaign.symbol ?? '?'} by borrowing.`
            : campaign.description
      }
    />
    {!!campaign.steps?.length && (
      <Stack>
        <Typography variant="bodySBold">{t`Steps:`}</Typography>
        <Box component="ol" sx={{ margin: 0, paddingInlineStart: '2ch' }}>
          {campaign.steps.map(step => (
            <Typography component="li" variant="bodySRegular" key={step} sx={{ listStyle: 'decimal' }}>
              {step}
            </Typography>
          ))}
        </Box>
      </Stack>
    )}
    <TooltipFooter>
      {t`External rewards are project dependent, always check with the token issuer to make sure you have taken all the necessary actions to benefit from their rewards program.`}
    </TooltipFooter>
    <TooltipValueLink href={campaign.dashboardLink}>{t`Go to issuer`}</TooltipValueLink>
  </TooltipWrapper>
)
