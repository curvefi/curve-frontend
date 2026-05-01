import { type ReactNode, type MouseEvent, useCallback } from 'react'
import { TooltipDescription, TooltipWrapper } from '@/llamalend/widgets/tooltips'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { PRESET_RANGES, LoanPreset } from '../../../constants'

const PRESETS = {
  [LoanPreset.Safe]: {
    title: t`Conservative`,
    description:
      t`Sets up your Llamalend loan to offer the maximum safety by spreading your liquidity across more bands. ` +
      `This does not fully protect you from liquidation, but could give you more time to repay or close your loan in case of sudden price movements.`,
  },
  [LoanPreset.MaxLtv]: {
    title: t`Max LTV`,
    description:
      t`Sets up your Llamalend loan to offer the maximum LTV (highest loan to value ratio) against your collateral. ` +
      `This implies higher risks.`,
  },
  [LoanPreset.Custom]: {
    title: t`Custom`,
    description: t`Setup your loan as you like it.`,
  },
}

const { Spacing } = SizesAndSpaces

export const LoanPresetSelector = ({
  preset,
  setPreset,
  setRange,
  children,
}: {
  preset: LoanPreset | undefined
  setPreset: (value: LoanPreset) => void
  setRange: (value: number) => void
  children: ReactNode
}) => (
  <Stack>
    <Stack gap={Spacing.xs}>
      <Typography variant="bodyXsRegular" color="textSecondary">{t`Liquidation protection setup`}</Typography>
      <ToggleButtonGroup
        exclusive
        compact
        value={preset}
        onChange={useCallback(
          (_: MouseEvent<HTMLElement>, p: LoanPreset) => {
            setPreset(p)
            setRange(PRESET_RANGES[p])
          },
          [setPreset, setRange],
        )}
        aria-label={t`Loan Preset`}
        sx={{ width: '100%' }}
      >
        {Object.values(LoanPreset).map(p => (
          <Tooltip
            title={PRESETS[p].title}
            body={
              <TooltipWrapper>
                <TooltipDescription text={PRESETS[p].description} />
              </TooltipWrapper>
            }
            key={p}
          >
            <ToggleButton
              value={p}
              size="extraSmall"
              data-testid={`loan-preset-${p}`}
              sx={{ flex: 1, whiteSpace: 'nowrap' }}
            >
              {PRESETS[p].title}
            </ToggleButton>
          </Tooltip>
        ))}
      </ToggleButtonGroup>
    </Stack>
    {children}
  </Stack>
)
