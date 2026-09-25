/* eslint-disable react-refresh/only-export-components -- tooltip option builders, not a rendered module */
import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { TooltipDescription, TooltipItem, TooltipItems, TooltipWrapper } from '@ui/components/TooltipComponents'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { ArrowTopRightIcon } from '@ui/icons/ArrowTopRightIcon'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

const LEARN_MORE_URL = 'https://docs.curve.finance/user/llamalend/liquidation-protection/how-it-works'

const tooltipChrome = { placement: 'top' as const, arrow: false, clickable: true }

const LearnMore = () => (
  <Button
    component={Link}
    href={LEARN_MORE_URL}
    target="_blank"
    rel="noopener noreferrer"
    color="ghost"
    variant="link"
    size="small"
    endIcon={<ArrowTopRightIcon />}
    sx={{ alignSelf: 'flex-start', px: 0 }}
  >
    {t`Learn More`}
  </Button>
)

/** Stacked fraction. Kept local so tooltips can show a formula without a math typesetting dependency. */
const Fraction = ({ numerator, denominator }: { numerator: ReactNode; denominator: ReactNode }) => (
  <Stack
    component="span"
    sx={{
      display: 'inline-flex',
      verticalAlign: 'middle',
      alignItems: 'center',
      mx: '0.35em',
      lineHeight: 1.15,
      textAlign: 'center',
    }}
  >
    <Typography variant="bodyXsRegular" color="textSecondary" component="span">
      {numerator}
    </Typography>
    <Box component="span" sx={{ alignSelf: 'stretch', borderTop: '1px solid', borderColor: 'text.secondary', minWidth: '100%' }} />
    <Typography variant="bodyXsRegular" color="textSecondary" component="span">
      {denominator}
    </Typography>
  </Stack>
)

const Equation = ({ children }: { children: ReactNode }) => (
  <Typography
    variant="bodySRegular"
    color="textSecondary"
    component="div"
    sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', columnGap: '0.35em', rowGap: Spacing.xs }}
  >
    {children}
  </Typography>
)

const EdgeMark = ({ edge }: { edge: 'top' | 'bottom' }) => (
  <Stack sx={{ width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
    <Stack
      sx={{
        width: 16,
        height: 2,
        bgcolor: theme =>
          edge === 'top'
            ? theme.design.Chart.LiquidationZone.CurrentTopLine
            : theme.design.Chart.LiquidationZone.CurrentBottomLine,
      }}
    />
  </Stack>
)

export const healthTooltip = () => ({
  ...tooltipChrome,
  title: t`Health`,
  body: (
    <TooltipWrapper>
      <TooltipDescription text={t`Shows how far your position is from the Liquidation Range.`} />
      <TooltipDescription
        text={t`At 1, Liquidation Protection is active. Once active, monitor your Liquidation buffer.`}
      />
      <Equation>
        {t`Health = max`}(
        <Fraction numerator={t`Oracle price`} denominator={t`Top of the liquidation range`} />
        , 1)
      </Equation>
      <LearnMore />
    </TooltipWrapper>
  ),
})

export const bufferTooltip = () => ({
  ...tooltipChrome,
  title: t`Liquidation buffer`,
  body: (
    <TooltipWrapper>
      <TooltipDescription text={t`Shows how much liquidation-adjusted value remains above your debt.`} />
      <TooltipDescription text={t`A 5% buffer means your position has value equal to 105% of its debt.`} />
      <TooltipDescription
        text={t`At 0%, there is no buffer left and the position becomes eligible for hard liquidation.`}
      />
      <Equation>
        {t`Buffer`}
        <Fraction numerator={t`Liquidation-adjusted value − Debt`} denominator={t`Debt`} />
        × 100
      </Equation>
      <LearnMore />
    </TooltipWrapper>
  ),
})

export const statusTooltip = () => ({
  ...tooltipChrome,
  title: t`Status`,
  body: (
    <TooltipWrapper>
      <TooltipDescription
        text={t`Summarizes the current state of your position based on its Liquidation range and remaining Liquidation buffer.`}
      />
      <Stack
        sx={{
          display: 'grid',
          gridTemplateColumns: '0.53fr 1fr',
          gap: Spacing.xs,
          p: Spacing.sm,
          bgcolor: theme => theme.design.Layer[2].Fill,
        }}
      >
        {(
          [
            [t`Healthy`, t`Above the Liquidation range with buffer remaining.`],
            [t`Liquidation Protection`, t`In the range; LLAMMA conversions can occur.`],
            [t`Below range`, t`Below the range, but the position remains open while buffer remains.`],
            [t`Hard liquidation`, t`Liquidation buffer is exhausted and the position is eligible for hard liquidation.`],
          ] as const
        ).map(([label, description]) => (
          <Stack key={label} sx={{ display: 'contents' }}>
            <Typography variant="bodySRegular" color="textPrimary">
              {label}
            </Typography>
            <Typography variant="bodySRegular" color="textSecondary">
              {description}
            </Typography>
          </Stack>
        ))}
      </Stack>
      <LearnMore />
    </TooltipWrapper>
  ),
})

export const collateralTooltip = () => ({
  ...tooltipChrome,
  title: t`Collateral value`,
  body: (
    <TooltipWrapper>
      <TooltipDescription
        text={t`Current value of the assets securing your debt. During Liquidation Protection, LLAMMA can convert collateral into the borrowed asset, changing the position’s composition and value.`}
      />
      <LearnMore />
    </TooltipWrapper>
  ),
})

export const debtTooltip = () => ({
  ...tooltipChrome,
  title: t`Total debt`,
  body: (
    <TooltipWrapper>
      <TooltipDescription
        text={t`Total amount currently owed, including accrued borrowing interest. Debt increases over time according to the market’s borrow rate.`}
      />
      <LearnMore />
    </TooltipWrapper>
  ),
})

export const leverageTooltip = () => ({
  ...tooltipChrome,
  title: t`Leverage`,
  body: (
    <TooltipWrapper>
      <TooltipDescription
        text={t`Your current exposure relative to your own equity. Higher leverage amplifies both gains and losses. Only shown for multiplied positions.`}
      />
      <Equation>
        {t`Leverage`}
        <Fraction numerator={t`Exposure`} denominator={t`Equity`} />
      </Equation>
      <Equation>
        {t`Equity`}
        {' = '}
        {t`Position value − Debt`}
      </Equation>
      <LearnMore />
    </TooltipWrapper>
  ),
})

export const roeTooltip = () => ({
  ...tooltipChrome,
  title: t`Return on equity`,
  body: (
    <TooltipWrapper>
      <TooltipDescription
        text={t`Estimated annualized return on your own capital from collateral yield minus borrowing costs, amplified by leverage. Positive means yield exceeds financing costs; negative means borrowing costs exceed yield.`}
      />
      <Equation>
        {t`ROE`}
        <Fraction numerator={t`Annual asset yield − Annual borrowing costs`} denominator={t`Equity`} />
        × 100
      </Equation>
      <TooltipDescription text={t`Excludes asset-price changes and LLAMMA conversion losses.`} />
      <LearnMore />
    </TooltipWrapper>
  ),
})

export const rangeTooltip = ({
  pair,
  upper,
  lower,
  bandCount,
  bandRange,
}: {
  pair: string
  upper?: string
  lower?: string
  bandCount?: number
  bandRange?: string
}) => ({
  ...tooltipChrome,
  title: t`Liquidation range`,
  body: (
    <TooltipWrapper>
      <TooltipDescription
        text={t`The oracle-price range where LLAMMA converts collateral. Conversions can cause losses and deplete the liquidation buffer.`}
      />
      <Typography variant="bodySRegular" color="textSecondary">
        {t`The lower edge is`} <u>{t`not`}</u> {t`a hard-liquidation price.`}
      </Typography>
      <TooltipItems secondary>
        <TooltipItem title={t`Range details`} variant="independent">
          {pair}
        </TooltipItem>
        <TooltipItem title={t`Top edge`} titleAdornment={<EdgeMark edge="top" />} variant="subItem">
          {upper}
        </TooltipItem>
        <TooltipItem title={t`Bottom edge`} titleAdornment={<EdgeMark edge="bottom" />} variant="subItem">
          {lower}
        </TooltipItem>
        <TooltipItem title={t`Amount of bands`} variant="subItem">
          {bandCount}
        </TooltipItem>
        <TooltipItem title={t`Band range`} variant="subItem">
          {bandRange}
        </TooltipItem>
      </TooltipItems>
      <LearnMore />
    </TooltipWrapper>
  ),
})
