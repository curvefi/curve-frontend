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
            title={PRESET_TOOLTIP_TITLE}
            body={
              <TooltipWrapper>
                <TooltipDescription text={PRESET_TOOLTIP_BODY} />
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
