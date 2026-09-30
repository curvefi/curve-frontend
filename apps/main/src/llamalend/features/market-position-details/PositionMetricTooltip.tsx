/* eslint-disable react-refresh/only-export-components -- tooltip option builders, not a rendered module */
import type { ReactNode } from 'react'
import { ESTIMATED_LEVERAGED_APR_TITLE, RANGE_HEALTH_DESCRIPTION } from '@/llamalend/constants'
import Box from '@mui/material/Box'
import type { PopperProps } from '@mui/material/Popper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  TooltipDescription,
  TooltipFooter,
  TooltipItem,
  TooltipItems,
  TooltipWrapper,
} from '@ui/components/TooltipComponents'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'

const { Spacing } = SizesAndSpaces

// Expanded calculations must trigger a fresh tooltip placement.
const resizeModifier: NonNullable<PopperProps['modifiers']>[number] = {
  name: 'contentResize',
  enabled: true,
  phase: 'write',
  fn: () => undefined,
  effect: ({ state, instance }) => {
    const observer = new ResizeObserver(() => void instance.update())
    observer.observe(state.elements.popper)
    return () => observer.disconnect()
  },
}

const tooltipChrome = {
  placement: 'top' as const,
  arrow: false,
  clickable: true,
  mobileDrawer: true,
  slotProps: { popper: { modifiers: [resizeModifier] } },
}

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

const Calculation = ({ children }: { children: ReactNode }) => (
  <Box component="details">
    <Typography
      component="summary"
      variant="bodyXsBold"
      color="textSecondary"
      sx={{
        cursor: 'pointer',
        py: Spacing.xxs,
        '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
      }}
    >
      {t`Calculation`}
    </Typography>
    <Stack sx={{ gap: Spacing.xs, mt: Spacing.xs }}>{children}</Stack>
  </Box>
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
      <TooltipDescription text={RANGE_HEALTH_DESCRIPTION} />
      <Calculation>
        <HealthEquation />
      </Calculation>
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
  amount,
  symbol,
}: { criticalBuffer?: string; amount?: string; symbol?: string } = {}) => ({
  ...tooltipChrome,
  title: t`Liquidation buffer`,
  body: (
    <TooltipWrapper>
      <TooltipDescription
        text={t`At 0%, no liquidation margin remains. Below 0%, the position is liquidatable. The buffer measures liquidation-adjusted margin as a percentage of debt.`}
      />
      {amount != null && (
        <TooltipItems secondary>
          <TooltipItem title={t`Buffer amount`} variant="independent">
            {amount}
            {symbol}
          </TooltipItem>
          {criticalBuffer != null && (
            <TooltipItem title={t`Red at or below`} variant="independent">
              {criticalBuffer}
            </TooltipItem>
          )}
        </TooltipItems>
      )}
      <Calculation>
        <BufferEquations />
      </Calculation>
      <TooltipFooter>
        {t`Not a price-drop allowance or withdrawable equity.`}
        {criticalBuffer != null && t` Warning cutoffs are provisional.`}
      </TooltipFooter>
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
}: { label?: string; category?: string; nearRange?: string; criticalBuffer?: string; observedAt?: number } = {}) => ({
  ...tooltipChrome,
  title: t`Status`,
  body: (
    <TooltipWrapper>
      <TooltipDescription
        text={
          label === 'In range'
            ? t`The oracle is within the liquidation range. Collateral can convert and incur losses; consider closing or resetting.`
            : label === 'Below range'
              ? t`The oracle is below the liquidation range. The lower boundary is not the hard-liquidation price.`
              : label === 'Liquidatable'
                ? t`The position can be hard-liquidated.`
                : label === 'Position closed'
                  ? t`No debt remains.`
                  : label === 'Status unavailable' || !label
                    ? t`Status needs a valid oracle price and liquidation range.`
                    : label === 'Near range'
                      ? t`The oracle is above the range, within the Near range cutoff.`
                      : t`The oracle is above the range, outside the Near range cutoff.`
        }
      />
      <TooltipItems secondary>
        <TooltipItem title={t`Market type`} variant="independent">
          {category === 'correlated'
            ? t`Correlated`
            : category === 'blue-chip'
              ? t`Blue-chip`
              : category === 'long-tail'
                ? t`Long-tail`
                : t`Uncategorized`}
        </TooltipItem>
        <TooltipItem title={t`Near range cutoff`} variant="independent">
          {nearRange ? `≤ ${nearRange}` : t`Not set`}
        </TooltipItem>
        <TooltipItem title={t`Buffer warning cutoff`} variant="independent">
          {criticalBuffer ? `≤ ${criticalBuffer}` : t`Not set`}
        </TooltipItem>
      </TooltipItems>
      <TooltipFooter>{t`Cutoffs are provisional. Hard liquidation requires full Controller health below 0, not exactly 0.`}</TooltipFooter>
      {observedAt != null && (
        <TooltipFooter>{t`Full health read: ${new Date(observedAt).toLocaleString()}`}</TooltipFooter>
      )}
    </TooltipWrapper>
  ),
})

export const collateralTooltip = ({
  collateralShare,
  convertedShare,
  collateralSymbol,
  convertedSymbol,
}: {
  collateralShare?: string
  convertedShare?: string
  collateralSymbol?: string
  convertedSymbol?: string
} = {}) => ({
  ...tooltipChrome,
  title: t`Collateral value`,
  body: (
    <TooltipWrapper>
      <TooltipDescription
        text={t`Combined value of remaining collateral and converted borrowed assets backing the debt.`}
      />
      {collateralShare != null && convertedShare != null && (
        <TooltipItems secondary>
          <TooltipItem title={t`Remaining collateral`} variant="independent">
            {collateralShare}
            {collateralSymbol}
          </TooltipItem>
          <TooltipItem title={t`Converted assets`} variant="independent">
            {convertedShare}
            {convertedSymbol}
          </TooltipItem>
        </TooltipItems>
      )}
      <Calculation>
        <CollateralEquations />
      </Calculation>
      <TooltipFooter>{t`A zero total is unavailable, not 100% cash.`}</TooltipFooter>
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

export const debtTooltip = ({ usdValue }: { usdValue?: string } = {}) => ({
  ...tooltipChrome,
  title: t`Total debt`,
  body: (
    <TooltipWrapper>
      <TooltipDescription text={t`Current debt in the debt token, including accrued interest.`} />
      {usdValue != null && (
        <TooltipItems secondary>
          <TooltipItem title={t`USD value`} variant="independent">
            {usdValue}
          </TooltipItem>
        </TooltipItems>
      )}
    </TooltipWrapper>
  ),
})

export const leverageTooltip = () => ({
  ...tooltipChrome,
  title: t`Leverage`,
  body: (
    <TooltipWrapper>
      <TooltipDescription text={t`Remaining collateral exposure divided by net position value (assets minus debt).`} />
      <Calculation>
        <LeverageEquation />
      </Calculation>
      <TooltipFooter>{t`Amplifies price gains, losses and collateral yield, less borrowing costs. Not the yield multiplier.`}</TooltipFooter>
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

export const roeTooltip = ({ yieldMultiplier }: { yieldMultiplier?: string } = {}) => ({
  ...tooltipChrome,
  title: ESTIMATED_LEVERAGED_APR_TITLE,
  body: (
    <TooltipWrapper>
      <TooltipDescription
        text={t`Estimated annual rate after borrowing costs, based on current composition and rates. Not realised return or PnL.`}
      />
      {yieldMultiplier != null && (
        <TooltipItems secondary>
          <TooltipItem title={t`Yield multiplier`} variant="independent">
            {yieldMultiplier}
          </TooltipItem>
        </TooltipItems>
      )}
      <Calculation>
        <RoeEquations />
        <TooltipFooter>{t`Lender CRV rewards are not borrower income.`}</TooltipFooter>
      </Calculation>
      <TooltipFooter>{t`Excludes price movement, conversion gains or losses, and reinvestment. The yield multiplier is not exposure leverage.`}</TooltipFooter>
    </TooltipWrapper>
  ),
})

export const RoeEquations = () => (
  <>
    <Equation>
      {t`Leveraged APR`}
      {' = '}
      <Fraction
        numerator={t`Annual asset yield + eligible rewards − gross borrowing costs`}
        denominator={t`Net position value`}
      />
      {' × 100'}
    </Equation>
    <Equation>
      {t`Yield multiplier`}
      {' = '}
      <Fraction numerator={t`Leveraged APR`} denominator={t`Unleveraged collateral APR`} />
    </Equation>
    <FormulaTerms terms={[t`Net position value = assets minus debt`]} />
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
        text={t`Price change needed to reach the liquidation range: − for a drop from above, + for a rise from below.`}
      />
      <TooltipItems secondary>
        <TooltipItem title={t`Upper boundary`} titleAdornment={<EdgeMark edge="top" />} variant="independent">
          {upper ?? t`Unavailable`}
          {pair}
        </TooltipItem>
        <TooltipItem title={t`Lower boundary`} titleAdornment={<EdgeMark edge="bottom" />} variant="independent">
          {lower ?? t`Unavailable`}
          {pair}
        </TooltipItem>
      </TooltipItems>
      <Calculation>
        <RangeEquations />
        <TooltipItems>
          <TooltipItem title={t`Band count`} variant="independent">
            {bandCount ?? t`Unavailable`}
          </TooltipItem>
          <TooltipItem title={t`Bands`} variant="independent">
            {bandRange ?? t`Unavailable`}
          </TooltipItem>
        </TooltipItems>
      </Calculation>
      <TooltipFooter>{t`Conversion losses may persist after price recovery. The lower boundary is not the hard-liquidation price.`}</TooltipFooter>
    </TooltipWrapper>
  ),
})

export const RangeEquations = () => (
  <>
    <Equation>
      {t`Above`}
      {' = '}
      <Fraction numerator="upper − price" denominator="price" />
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
