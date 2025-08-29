import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

export enum LoanPreset {
  MaxSafety = 'MaxSafety',
  MaxBorrow = 'MaxBorrow',
  Advanced = 'Advanced',
}

interface LoanPresetSelectorProps {
  preset: LoanPreset
  onChange: (value: LoanPreset) => void
}

const titles = {
  [LoanPreset.MaxSafety]: t`Max Safety`,
  [LoanPreset.MaxBorrow]: t`Max Borrow`,
  [LoanPreset.Advanced]: t`Advanced`,
}

const { Spacing } = SizesAndSpaces

export const LoanPresetSelector = ({ preset, onChange }: LoanPresetSelectorProps) => (
  <Stack gap={Spacing.sm}>
    <Stack direction="row">
      {Object.values(LoanPreset).map((value) => (
        // todo: we need to implement button toggle colors & actual toggle component
        <Button
          key={value}
          {...(preset === value && { color: 'secondary' })}
          onClick={() => onChange(value)}
          sx={{
            flexGrow: 1,
          }}
        >
          {titles[value]}
        </Button>
      ))}
    </Stack>
    <Alert severity="info" variant="outlined" sx={{ boxShadow: 'none' }}>
      <AlertTitle>{titles[preset]}</AlertTitle>
      {t`Sets up your Llamalend loan to offer the maximum safety by spreading your liquidity across fewer bands. This does not protect you from liquidation, but could give you more time to repay or close your loan in case of sudden price movements.`}
      {/* todo: learn more about llamalend presets link */}
    </Alert>
  </Stack>
)
