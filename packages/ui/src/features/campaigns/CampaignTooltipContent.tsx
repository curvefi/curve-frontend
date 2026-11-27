import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatDate } from '@primitives/date.utils'
import { formatNumber } from '@primitives/number.utils'
import { TooltipDescription, TooltipFooter, TooltipValueLink, TooltipWrapper } from '@ui/components/TooltipComponents'
import { t } from '@ui/lib/i18n'
import type { CampaignRewards } from './types'

export const CampaignTooltipContent = ({
  campaign: { action, campaignName, dashboardLink, description, period, platform, reward, steps, symbol },
  showRate,
}: {
  campaign: CampaignRewards
  showRate: boolean
}) => (
  <TooltipWrapper>
    {showRate && reward?.type === 'apr' && (
      <Typography variant="bodySRegular" sx={{ textAlign: 'start' }}>
        {t`APR`}: {formatNumber(reward.value, 'percent.rate')}
      </Typography>
    )}
    <Stack>
      <Typography variant="bodySBold">{campaignName || platform}</Typography>
      {campaignName && platform && <TooltipDescription text={t`by ${platform}`} />}
    </Stack>
    {period && (
      <Stack>
        <TooltipDescription text={t`from: ${formatDate(period[0])}`} />
        <TooltipDescription text={t`to: ${formatDate(period[1])}`} />
      </Stack>
    )}
    <TooltipDescription
      text={
        action === 'supply'
          ? t`Earn ${symbol ?? '?'} by supplying liquidity.`
          : action === 'borrow'
            ? t`Earn ${symbol ?? '?'} by borrowing.`
            : description
      }
    />
    {!!steps?.length && (
      <Stack>
        <Typography variant="bodySBold">{t`Steps:`}</Typography>
        <Box component="ol" sx={{ margin: 0, paddingInlineStart: '2ch' }}>
          {steps.map(step => (
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
    <TooltipValueLink href={dashboardLink}>{t`Go to issuer`}</TooltipValueLink>
  </TooltipWrapper>
)
