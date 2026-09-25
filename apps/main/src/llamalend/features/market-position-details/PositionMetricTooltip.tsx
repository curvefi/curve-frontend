/* eslint-disable react-refresh/only-export-components -- tooltip option builders, not a rendered module */
import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { TooltipDescription, TooltipItem, TooltipItems, TooltipWrapper } from '@ui/components/TooltipComponents'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

const tooltipChrome = { placement: 'top' as const, arrow: false, clickable: true }


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
      <TooltipDescription
        text={t`Proximity to the start of the Liquidation range. Health remains 1.00 at or below the upper edge. Monitor the Liquidation buffer after that.`}
      />
      <Equation>
        {t`Health`}
        {' = max('}
        <Fraction numerator={t`Oracle price`} denominator={t`Upper boundary`} />
        {', 1)'}
      </Equation>
    </TooltipWrapper>
  ),
})

export const bufferTooltip = (_options: { predicate?: 'strict-negative' | 'unverified' } = {}) => ({
  ...tooltipChrome,
  title: t`Liquidation buffer`,
  body: (
    <TooltipWrapper>
      <TooltipDescription
        text={t`Debt-relative liquidation-adjusted margin. This is not a price-drop allowance and it is not withdrawable equity.`}
      />
      <Equation>
        {t`Buffer %`}
        {' = '}
        <Fraction numerator={t`Adjusted value − Debt`} denominator={t`Debt`} />
        {' × 100'}
      </Equation>
      <Equation>
        {t`Buffer amount`}
        {' = '}
        <Fraction numerator={t`Debt × Buffer %`} denominator="100" />
      </Equation>
      <TooltipDescription
        text={
          t`This uses the same Controller full-health read as the rest of the market. Liquidatable means that value is strictly below 0. Exact zero is critical, not liquidatable. Self and approved close use a different check. This is not a deployment-matched safety certificate.`
        }
      />
    </TooltipWrapper>
  ),
})

export const statusTooltip = ({
  label,
  category,
  nearRange,
  lowBuffer,
  criticalBuffer,
  observedAt,
}: {
  label?: string
  category?: string
  nearRange?: string
  lowBuffer?: string
  criticalBuffer?: string
  predicate?: 'strict-negative' | 'unverified'
  observedAt?: number
} = {}) => ({
  ...tooltipChrome,
  title: t`Status`,
  body: (
    <TooltipWrapper>
      <TooltipDescription text={label ? t`Resolved status: ${label}` : t`Status is not resolved yet.`} />
      <TooltipItems secondary>
        <TooltipItem title={t`Category`} variant="independent">
          {category ?? t`Uncategorized`}
        </TooltipItem>
        <TooltipItem title={t`Near range`} variant="subItem">
          {nearRange ?? t`Provisional`}
        </TooltipItem>
        <TooltipItem title={t`Low buffer`} variant="subItem">
          {lowBuffer ?? t`Provisional`}
        </TooltipItem>
        <TooltipItem title={t`Critical buffer`} variant="subItem">
          {criticalBuffer ?? t`Provisional`}
        </TooltipItem>
        <TooltipItem title={t`Predicate`} variant="subItem">
          {t`Controller full health < 0. Exact zero is critical, not liquidatable.`}
        </TooltipItem>
        <TooltipItem title={t`Observed`} variant="subItem">
          {observedAt != null ? new Date(observedAt).toLocaleString() : t`Unavailable`}
        </TooltipItem>
      </TooltipItems>
    </TooltipWrapper>
  ),
})

export const collateralTooltip = () => ({
  ...tooltipChrome,
  title: t`Collateral value`,
  body: (
    <TooltipWrapper>
      <TooltipDescription
        text={t`Remaining collateral and converted borrowed assets backing the debt. A zero total is unavailable, not 100% cash.`}
      />
      <Equation>
        {t`Collateral value`}
        {' = q × p + b'}
      </Equation>
      <Equation>
        {t`Value share`}
        {' = '}
        <Fraction numerator={t`Token value`} denominator={t`Collateral value`} />
      </Equation>
    </TooltipWrapper>
  ),
})

export const debtTooltip = () => ({
  ...tooltipChrome,
  title: t`Total debt`,
  body: (
    <TooltipWrapper>
      <TooltipDescription
        text={t`Current Controller debt, including accrued interest. The token and the snapshot time are the ones on this card.`}
      />
    </TooltipWrapper>
  ),
})

export const leverageTooltip = () => ({
  ...tooltipChrome,
  title: t`Leverage`,
  body: (
    <TooltipWrapper>
      <TooltipDescription
        text={t`Remaining collateral exposure over equity. It amplifies relative-price gains and losses and potential collateral yield, less borrowing costs. It is not the yield multiplier.`}
      />
      <Equation>
        {t`Leverage`}
        {' = '}
        <Fraction numerator="q × p" denominator="q × p + b − d" />
      </Equation>
    </TooltipWrapper>
  ),
})

export const roeTooltip = () => ({
  ...tooltipChrome,
  title: t`Return on equity`,
  body: (
    <TooltipWrapper>
      <TooltipDescription
        text={t`Current composition and rates, as an APR with no assumed reinvestment. Excludes price movement and conversion profit or loss.`}
      />
      <Equation>
        {t`ROE APR`}
        {' = '}
        <Fraction
          numerator={t`Annual asset yield + eligible rewards − gross borrowing costs`}
          denominator={t`Equity`}
        />
        {' × 100'}
      </Equation>
      <Equation>
        {t`Yield multiplier`}
        {' = '}
        <Fraction numerator={t`ROE APR`} denominator={t`Unleveraged collateral APR`} />
      </Equation>
      <TooltipDescription
        text={t`The multiplier uses the same collateral yield as the estimate. It is not exposure leverage. Lender CRV rewards are not borrower income.`}
      />
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
        text={t`Conversions may occur both ways. Losses need not recover when the price recovers. The lower edge is not the hard-liquidation price.`}
      />
      <Equation>
        {t`Above`}
        {' = '}
        <Fraction numerator="p − u" denominator="p" />
        {' × 100'}
      </Equation>
      <Equation>
        {t`Below`}
        {' = '}
        <Fraction numerator="l − p" denominator="p" />
        {' × 100'}
      </Equation>
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
    </TooltipWrapper>
  ),
})
