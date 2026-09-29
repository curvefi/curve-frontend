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
export const Fraction = ({ numerator, denominator }: { numerator: ReactNode; denominator: ReactNode }) => (
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
    <Box
      component="span"
      sx={{ alignSelf: 'stretch', borderTop: '1px solid', borderColor: 'text.secondary', minWidth: '100%' }}
    />
    <Typography variant="bodyXsRegular" color="textSecondary" component="span">
      {denominator}
    </Typography>
  </Stack>
)

export const Equation = ({ children }: { children: ReactNode }) => (
  <Typography
    variant="bodySRegular"
    color="textSecondary"
    component="div"
    sx={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      columnGap: '0.35em',
      rowGap: Spacing.xs,
      border: '1px solid',
      borderColor: theme => theme.design.Layer[1].Outline,
      borderRadius: theme => theme.design.Button.Radius.sm,
      bgcolor: theme => theme.design.Layer[2].Fill,
      px: Spacing.sm,
      py: Spacing.xs,
    }}
  >
    {children}
  </Typography>
)

const FormulaTerms = ({ terms }: { terms: string[] }) => (
  <Stack sx={{ gap: Spacing.xxs }}>
    {terms.map(term => (
      <TooltipDescription key={term} text={term} />
    ))}
  </Stack>
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
      <HealthEquation />
    </TooltipWrapper>
  ),
})

export const HealthEquation = () => (
  <Equation>
    {t`Health`}
    {' = max('}
    <Fraction numerator={t`Oracle price`} denominator={t`Upper boundary`} />
    {', 1)'}
  </Equation>
)

export const bufferTooltip = ({
  criticalBuffer,
}: { criticalBuffer?: string } = {}) => ({
  ...tooltipChrome,
  title: t`Liquidation buffer`,
  body: (
    <TooltipWrapper>
      <TooltipDescription
        text={t`Debt-relative liquidation-adjusted margin. This is not a price-drop allowance and it is not withdrawable equity.`}
      />
      <BufferEquations />
      <TooltipDescription
        text={t`The displayed percentage is healthFull. Liquidatable requires healthFull below 0; exactly 0 does not meet that condition. Self and approved close use a different check.`}
      />
      {criticalBuffer && (
        <TooltipDescription
          text={t`The buffer value turns red at or below ${criticalBuffer}%. This provisional cutoff depends on the market category.`}
        />
      )}
    </TooltipWrapper>
  ),
})

export const BufferEquations = () => (
  <>
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
  </>
)

export const statusTooltip = ({
  label,
  category,
  nearRange,
  criticalBuffer,
  observedAt,
}: {
  label?: string
  category?: string
  nearRange?: string
  criticalBuffer?: string
  observedAt?: number
} = {}) => ({
  ...tooltipChrome,
  title: t`Status`,
  body: (
    <TooltipWrapper>
      <TooltipDescription text={label ? t`Resolved status: ${label}` : t`Status is not resolved yet.`} />
      <TooltipDescription
        text={t`Status shows whether the oracle is Above range, Near range, In range, or Below range. The Near range cutoff depends on the market category and is provisional. In range, collateral may be converting; consider closing or resetting the position.`}
      />
      <TooltipItems secondary>
        <TooltipItem title={t`Category`} variant="independent">
          {category ?? t`Uncategorized`}
        </TooltipItem>
        <TooltipItem title={t`Price drop to range ≤`} variant="subItem">
          {nearRange ?? t`Provisional`}
        </TooltipItem>
        <TooltipItem title={t`Buffer turns red at or below`} variant="subItem">
          {criticalBuffer ?? t`Provisional`}
        </TooltipItem>
        <TooltipItem title={t`Liquidatable when`} variant="subItem">
          {t`healthFull < 0. Exact zero does not meet this condition.`}
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
      <CollateralEquations />
    </TooltipWrapper>
  ),
})

export const CollateralEquations = () => (
  <>
    <Equation>
      {t`Collateral value`}
      {' = collateral × price + converted'}
    </Equation>
    <FormulaTerms
      terms={[
        t`collateral = remaining collateral quantity`,
        t`price = oracle price`,
        t`converted = converted borrowed assets`,
      ]}
    />
    <Equation>
      {t`Value share`}
      {' = '}
      <Fraction numerator={t`Token value`} denominator={t`Collateral value`} />
    </Equation>
  </>
)

export const debtTooltip = () => ({
  ...tooltipChrome,
  title: t`Total debt`,
  body: (
    <TooltipWrapper>
      <TooltipDescription text={t`Current debt in the debt token, including accrued interest.`} />
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
      <LeverageEquation />
    </TooltipWrapper>
  ),
})

export const LeverageEquation = () => (
  <>
    <Equation>
      {t`Leverage`}
      {' = '}
      <Fraction numerator="collateral × price" denominator="collateral × price + converted − debt" />
    </Equation>
    <FormulaTerms
      terms={[
        t`collateral = remaining collateral quantity`,
        t`price = oracle price`,
        t`converted = converted borrowed assets`,
        t`debt = current debt`,
      ]}
    />
  </>
)

export const roeTooltip = () => ({
  ...tooltipChrome,
  title: t`Return on equity`,
  body: (
    <TooltipWrapper>
      <TooltipDescription
        text={t`Current composition and rates, as an APR with no assumed reinvestment. Excludes price movement and conversion profit or loss.`}
      />
      <RoeEquations />
      <TooltipDescription
        text={t`The multiplier uses the same collateral yield as the estimate. It is not exposure leverage. Lender CRV rewards are not borrower income.`}
      />
    </TooltipWrapper>
  ),
})

export const RoeEquations = () => (
  <>
    <Equation>
      {t`RoE APR`}
      {' = '}
      <Fraction numerator={t`Annual asset yield + eligible rewards − gross borrowing costs`} denominator={t`Equity`} />
      {' × 100'}
    </Equation>
    <Equation>
      {t`Yield multiplier`}
      {' = '}
      <Fraction numerator={t`RoE APR`} denominator={t`Unleveraged collateral APR`} />
    </Equation>
    <FormulaTerms terms={[t`RoE = return on equity`, t`APR = annual percentage rate`]} />
  </>
)

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
  title: t`Distance to range`,
  body: (
    <TooltipWrapper>
      <TooltipDescription
        text={t`Conversions may occur both ways. Losses need not recover when the price recovers. The lower edge is not the hard-liquidation price.`}
      />
      <RangeEquations />
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
        <TooltipItem title={t`Band count`} variant="subItem">
          {bandCount}
        </TooltipItem>
        <TooltipItem title={t`Band range`} variant="subItem">
          {bandRange}
        </TooltipItem>
      </TooltipItems>
    </TooltipWrapper>
  ),
})

export const RangeEquations = () => (
  <>
    <Equation>
      {t`Above`}
      {' = '}
      <Fraction numerator="price − upper" denominator="price" />
      {' × 100'}
    </Equation>
    <Equation>
      {t`Below`}
      {' = '}
      <Fraction numerator="lower − price" denominator="price" />
      {' × 100'}
    </Equation>
    <FormulaTerms terms={[t`price = oracle price`, t`upper = upper range boundary`, t`lower = lower range boundary`]} />
  </>
)
