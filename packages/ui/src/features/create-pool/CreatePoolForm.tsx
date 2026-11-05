import { type ReactNode, useId, useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Step from '@mui/material/Step'
import StepButton from '@mui/material/StepButton'
import Stepper from '@mui/material/Stepper'
import { FormProvider } from '@ui/features/forms'
import { DetailPageLayout } from '@ui/features/layout/DetailPageLayout/DetailPageLayout'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useIsDesktop } from '@ui/hooks/useBreakpoints'
import { CREATE_POOL_SECTIONS } from './constants'
import { CreatePoolLiquidity } from './CreatePoolLiquidity'
import { CreatePoolNameFields } from './CreatePoolNameFields'
import { CreatePoolParameters } from './CreatePoolParameters'
import { CreatePoolSummary } from './CreatePoolSummary'
import { CreatePoolTokens } from './CreatePoolTokens'
import { CreatePoolType } from './CreatePoolType'
import type { CreatePoolFormProps } from './types'

const { Spacing } = SizesAndSpaces

const Section = ({ index, onFocus, children }: { index: number; onFocus: () => void; children: ReactNode }) => (
  <Card size="small" component="section" id={CREATE_POOL_SECTIONS[index].value} onFocusCapture={onFocus}>
    <CardHeader title={`${index + 1}. ${CREATE_POOL_SECTIONS[index].label}`} />
    <CardContent>
      <Stack sx={{ gap: Spacing.sm }}>{children}</Stack>
    </CardContent>
  </Card>
)

export const CreatePoolForm = (props: CreatePoolFormProps) => {
  const { form, onSubmit, inputsDisabled, isPending, completed, poolTypes, network, limits } = props
  // The mobile summary is portaled outside this form. Its submit button uses this ID to submit the page's inputs.
  const formId = useId()
  const [activeStep, setActiveStep] = useState(0)
  const isDesktop = useIsDesktop()
  return (
    <FormProvider {...form}>
      <Box component="form" id={formId} onSubmit={event => void onSubmit(event)} sx={{ overflowWrap: 'break-word' }}>
        <DetailPageLayout
          sidebar={
            <Box component="nav" sx={{ overflowX: 'auto', padding: Spacing.sm }}>
              <Stepper nonLinear activeStep={activeStep} orientation={isDesktop ? 'vertical' : 'horizontal'}>
                {CREATE_POOL_SECTIONS.map(({ value, label }, index) => (
                  <Step key={value} completed={completed[value]}>
                    <StepButton href={`#${value}`} onClick={() => setActiveStep(index)} disabled={isPending}>
                      {label}
                    </StepButton>
                  </Step>
                ))}
              </Stepper>
            </Box>
          }
          formTabs={{ placement: 'mobile-drawer', content: <CreatePoolSummary {...props} formId={formId} /> }}
        >
          <Stack sx={{ gap: Spacing.lg, minWidth: 0 }}>
            <Section index={0} onFocus={() => setActiveStep(0)}>
              <CreatePoolTokens {...props} />
            </Section>
            <Section index={1} onFocus={() => setActiveStep(1)}>
              <CreatePoolType
                network={network}
                poolTypes={poolTypes}
                disabled={inputsDisabled}
                poolType={form.values.poolType}
                update={form.update}
              />
            </Section>
            <Section index={2} onFocus={() => setActiveStep(2)}>
              <CreatePoolParameters
                disabled={inputsDisabled}
                ranges={limits}
                poolType={poolTypes.find(type => type.id === form.values.poolType)}
                values={form.values}
                tokenSymbol={form.values.token_0?.symbol}
                update={form.update}
                errors={form.formState.errors}
              />
            </Section>
            <Section index={3} onFocus={() => setActiveStep(3)}>
              <CreatePoolLiquidity {...props} />
            </Section>
            <Section index={4} onFocus={() => setActiveStep(4)}>
              <CreatePoolNameFields
                disabled={inputsDisabled}
                nameMaxBytes={limits.nameMaxBytes}
                symbolMaxBytes={limits.symbolMaxBytes}
                poolName={form.values.poolName}
                symbol={form.values.symbol}
              />
            </Section>
          </Stack>
        </DetailPageLayout>
      </Box>
    </FormProvider>
  )
}
