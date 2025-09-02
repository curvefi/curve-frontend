import { type ReactNode, type MouseEvent, useCallback } from 'react'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { BorrowPreset } from '../borrow.types'
import { BORROW_PRESET_RANGES } from '../borrow.util'

const PRESETS = {
  [BorrowPreset.Safe]: {
    title: t`Safe`,
    description:
      t`Sets up your Llamalend loan to offer the maximum safety by spreading your liquidity across fewer bands. ` +
      `This does not protect you from liquidation, but could give you more time to repay or close your loan in case of sudden price movements.`,
  },
  [BorrowPreset.MaxLtv]: {
    title: t`Max LTV`,
    description:
      t`Sets up your Llamalend loan to offer the maximum borrowing power by spreading your liquidity across more bands. ` +
      `This does not protect you from liquidation, but could give you more time to repay or close your loan in case of sudden price movements.`,
  },
  [BorrowPreset.Custom]: {
    title: t`Custom`,
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
  preset: BorrowPreset | undefined
  setPreset: (value: BorrowPreset) => void
  setRange: (value: number) => void
  children: ReactNode
}) => (
  <Stack gap={Spacing.sm}>
    <ToggleButtonGroup
      exclusive
      value={preset}
      onChange={useCallback(
        (_: MouseEvent<HTMLElement>, p: BorrowPreset) => {
          setPreset(p)
          setRange(BORROW_PRESET_RANGES[p])
        },
        [setPreset, setRange],
      )}
      aria-label={t`Loan Preset`}
      sx={{ width: '100%' }}
    >
      {Object.values(BorrowPreset).map((p) => (
        <ToggleButton
          key={p}
          value={p}
          sx={{ flexGrow: 1, '&': { lineHeight: '1rem' } }} // force lineHeight, otherwise when the text wraps it looks bad
        >
          {PRESETS[p].title}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
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
