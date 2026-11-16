import type { Ref } from 'react'
import Stack from '@mui/material/Stack'
import Step from '@mui/material/Step'
import StepButton from '@mui/material/StepButton'
import Stepper from '@mui/material/Stepper'
import Typography from '@mui/material/Typography'
import { RouterLink } from '@ui/components/RouterLink'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsDesktop } from '@ui/hooks/useBreakpoints'
import { t } from '@ui/lib/i18n'
import { CREATE_POOL_SECTIONS, type CreatePoolSection } from './constants'
import type { CreatePoolFormProps } from './types'

const { Spacing, ButtonSize } = SizesAndSpaces

export const CreatePoolStepper = ({
  ref,
  activeSection,
  completed,
  isPending,
}: Pick<CreatePoolFormProps, 'completed' | 'isPending'> & {
  ref: Ref<HTMLElement>
  activeSection: CreatePoolSection
}) => {
  const activeStep = CREATE_POOL_SECTIONS.findIndex(({ value }) => value === activeSection)
  return (
    <Stack ref={ref} component="nav" aria-label={t`Pool creation steps`} sx={{ gap: Spacing.xs, padding: Spacing.sm }}>
      <Stepper nonLinear activeStep={activeStep} orientation={useIsDesktop() ? 'vertical' : 'horizontal'}>
        {CREATE_POOL_SECTIONS.map(({ value, label }) => (
          <Step key={value} completed={completed[value]} sx={{ paddingInline: 0 }}>
            <StepButton
              component={RouterLink}
              href={`#${value}`}
              disabled={isPending}
              sx={t => ({
                [t.breakpoints.down('tablet')]: {
                  margin: 0,
                  padding: 0,
                  width: ButtonSize.sm,
                  height: ButtonSize.sm,
                  '& .MuiStepLabel-iconContainer': { marginRight: 0 },
                  '& .MuiStepLabel-labelContainer': { display: 'none' },
                },
              })}
            >
              {label}
            </StepButton>
          </Step>
        ))}
      </Stepper>
      <Typography variant="bodySBold" sx={{ display: { tablet: 'none' } }}>
        {t`Step ${activeStep + 1} of ${CREATE_POOL_SECTIONS.length}`} · {CREATE_POOL_SECTIONS[activeStep].label}
      </Typography>
    </Stack>
  )
}
