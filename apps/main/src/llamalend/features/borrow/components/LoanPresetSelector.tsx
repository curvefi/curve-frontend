import { type ReactNode, type MouseEvent, useCallback } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { PRESET_RANGES, LoanPreset } from '../../../constants'

const PRESETS = {
  [LoanPreset.Safe]: {
    title: t`Safe`,
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
      sx={{ width: '100%', paddingBottom: Spacing.sm }}
    >
      {Object.values(LoanPreset).map((p) => (
        <ToggleButton key={p} value={p} size="extraSmall" sx={{ flexGrow: 1 }} data-testid={`loan-preset-${p}`}>
          {PRESETS[p].title}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
    {preset && (
      <Alert severity="info" variant="outlined" sx={{ boxShadow: 'none', paddingBottom: Spacing.sm }}>
        <AlertTitle>{PRESETS[preset].title}</AlertTitle>
        {PRESETS[preset].description}
      </Alert>
    )}
    {children}
  </Stack>
)
