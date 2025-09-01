import { ReactNode } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { DEFAULT_RANGE_SIMPLE_MODE, RANGE_MAX_BORROW, RANGE_MAX_SAFETY } from '../borrow.types'

export enum LoanPreset {
  MaxSafety = 'MaxSafety',
  MaxBorrow = 'MaxBorrow',
  Advanced = 'Advanced',
}

const PRESETS = {
  [LoanPreset.MaxSafety]: {
    title: t`Max Safety`,
    range: RANGE_MAX_SAFETY,
    description:
      t`Sets up your Llamalend loan to offer the maximum safety by spreading your liquidity across fewer bands. ` +
      `This does not protect you from liquidation, but could give you more time to repay or close your loan in case of sudden price movements.`,
  },
  [LoanPreset.MaxBorrow]: {
    title: t`Max Borrow`,
    range: RANGE_MAX_BORROW,
    description:
      t`Sets up your Llamalend loan to offer the maximum borrowing power by spreading your liquidity across more bands. ` +
      `This does not protect you from liquidation, but could give you more time to repay or close your loan in case of sudden price movements.`,
  },
  [LoanPreset.Advanced]: {
    title: t`Advanced`,
    range: DEFAULT_RANGE_SIMPLE_MODE,
    description:
      t`Allows you to manually set the range for your Llamalend loan. ` +
      `This gives you the most flexibility, but also requires more knowledge about how Llamalend works.`,
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
  <Stack gap={Spacing.sm}>
    <Stack direction="row">
      {Object.values(LoanPreset).map((p, _, all) => (
        <Button
          key={p}
          // todo: we need to implement button toggle colors & actual toggle component
          color={preset === p ? 'secondary' : 'inherit'}
          onClick={() => {
            setPreset(p)
            setRange(PRESETS[p].range)
          }}
          sx={{ flexGrow: 1, '&': { lineHeight: '1rem' } }} // force lineHeight, otherwise when the text wraps it looks bad
        >
          {PRESETS[p].title}
        </Button>
      ))}
    </Stack>
    {children}
    {preset && (
      <Alert severity="info" variant="outlined" sx={{ boxShadow: 'none' }}>
        <AlertTitle>{PRESETS[preset].title}</AlertTitle>
        {PRESETS[preset].description}
        {/* todo: learn more about llamalend presets link */}
      </Alert>
    )}
  </Stack>
)
