import { type ReactNode, useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Step from '@mui/material/Step'
import StepButton from '@mui/material/StepButton'
import Stepper from '@mui/material/Stepper'
import { mapRecord } from '@primitives/objects.utils'
import { FormPlacementProvider } from '@ui/features/form-context/FormPlacementProvider'
import { Form } from '@ui/features/forms/components/Form'
import { FormAlerts } from '@ui/features/forms/FormAlerts'
import { useLayoutStore } from '@ui/features/layout/store'
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

const { Spacing, Width, MaxWidth } = SizesAndSpaces

const Section = ({ index, onFocus, children }: { index: number; onFocus: () => void; children: ReactNode }) => {
  const navHeight = useLayoutStore(state => state.navHeight)
  const scrollMarginTop = mapRecord(Spacing.md, (_, gap) => `calc(${navHeight}px + ${gap})`)
  return (
    <Card
      size="small"
      component="section"
      id={CREATE_POOL_SECTIONS[index].value}
      onFocusCapture={onFocus}
      sx={{ scrollMarginTop }}
    >
      <CardHeader title={`${index + 1}. ${CREATE_POOL_SECTIONS[index].label}`} />
      <CardContent>
        <Stack sx={{ gap: Spacing.sm }}>{children}</Stack>
      </CardContent>
    </Card>
  )
}

export const CreatePoolForm = (props: CreatePoolFormProps) => {
  const { form, onSubmit, inputsDisabled, isPending, completed, poolTypes, formErrors, userAddress, error } = props
  const [activeStep, setActiveStep] = useState(0)
  const isDesktop = useIsDesktop()
  const navHeight = useLayoutStore(state => state.navHeight)
  const sticky = {
    position: { tablet: 'sticky' },
    top: mapRecord(Spacing.md, (_, gap): string => `calc(${navHeight}px + ${gap})`),
    alignSelf: 'start',
  } as const
  return (
    <FormPlacementProvider placement="inline">
      <Form {...form} onSubmit={onSubmit} variant="plain">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              mobile: 'minmax(0, 1fr)',
              tablet: 'minmax(0, 1fr) minmax(16rem, 20rem)',
              desktop: `${Width.column.md}px minmax(0, ${MaxWidth.createPoolForm}) ${MaxWidth.createPoolSummary}`,
            },
            gap: Spacing.md,
            margin: Spacing.md,
            justifyContent: 'center',
          }}
        >
          <Box
            component="nav"
            sx={{
              ...sticky,
              position: { tablet: 'static', desktop: 'sticky' },
              gridColumn: { tablet: '1 / -1', desktop: 'auto' },
              overflowX: 'auto',
              padding: Spacing.sm,
            }}
          >
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
          <Stack sx={{ gap: Spacing.lg, minWidth: 0 }}>
            <Section index={0} onFocus={() => setActiveStep(0)}>
              <CreatePoolTokens {...props} />
            </Section>
            <Section index={1} onFocus={() => setActiveStep(1)}>
              <CreatePoolType poolTypes={poolTypes} disabled={inputsDisabled} />
            </Section>
            <Section index={2} onFocus={() => setActiveStep(2)}>
              <CreatePoolParameters
                disabled={inputsDisabled}
                ranges={props.parameterRanges}
                poolType={poolTypes.find(type => type.id === form.values.poolType)}
              />
            </Section>
            <Section index={3} onFocus={() => setActiveStep(3)}>
              <CreatePoolLiquidity {...props} />
            </Section>
            <Section index={4} onFocus={() => setActiveStep(4)}>
              <CreatePoolNameFields
                disabled={inputsDisabled}
                nameMaxBytes={props.nameMaxBytes}
                symbolMaxBytes={props.symbolMaxBytes}
                poolName={form.values.poolName}
                symbol={form.values.symbol}
              />
            </Section>
          </Stack>
          <Stack sx={{ ...sticky, gap: Spacing.md, minWidth: 0 }}>
            <CreatePoolSummary {...props} />
            <FormAlerts
              error={error}
              formErrors={formErrors}
              userAddress={userAddress}
              handledErrors={[
                'amplification',
                'fee',
                'feeMultiplier',
                'priceOracleAveragingWindow',
                'poolName',
                'symbol',
                'slippage',
              ]}
            />
          </Stack>
        </Box>
      </Form>
    </FormPlacementProvider>
  )
}
