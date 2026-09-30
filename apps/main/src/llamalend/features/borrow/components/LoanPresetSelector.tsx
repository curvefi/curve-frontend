import { type ReactNode, type MouseEvent, useCallback } from 'react'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { Tooltip } from '@ui/components/Tooltip'
import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { PRESET_RANGES, LoanPreset } from '../../../constants'

const PRESETS_DESCRIPTIONS = {
  [LoanPreset.Safe]: t`Default`,
  [LoanPreset.MaxLtv]: t`Max LTV`,
  [LoanPreset.Custom]: t`Custom`,
}

const PRESET_TOOLTIP_TITLE = t`Liquidation protection setup`
const PRESET_TOOLTIP_BODY = t`Liquidation protection setup enables you to set the depth of the liquidation range for your position and determines how gradually your position moves through soft liquidation. Wider protection gives your position more room to react to price moves. Narrower protection allows higher LTV, but increases liquidation risk.`

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
}) => {
  const beta = useNewLlamalendHealth()
  const title = beta ? t`Liquidation range setup` : PRESET_TOOLTIP_TITLE
  const description = beta
    ? t`Choose the width of your liquidation range. A wider range spreads collateral conversion across more bands. A narrower range allows higher LTV. Neither prevents losses.`
    : PRESET_TOOLTIP_BODY
  return (
    <Stack>
      <Stack sx={{ gap: Spacing.xs }}>
        <Typography variant="bodyXsRegular" color="textSecondary">
          {title}
        </Typography>
        <ToggleButtonGroup
          exclusive
          compact
          value={preset}
          onChange={useCallback(
            (_: MouseEvent<HTMLElement>, p: LoanPreset) => {
              setPreset(p)
              if (p !== LoanPreset.Custom) setRange(PRESET_RANGES[p])
            },
            [setPreset, setRange],
          )}
          aria-label={t`Loan Preset`}
          sx={{ width: '100%' }}
        >
          {Object.values(LoanPreset).map(p => (
            <Tooltip
              title={title}
              body={
                <TooltipWrapper>
                  <TooltipDescription text={description} />
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
                {PRESETS_DESCRIPTIONS[p]}
              </ToggleButton>
            </Tooltip>
          ))}
        </ToggleButtonGroup>
      </Stack>
      {children}
    </Stack>
  )
}
