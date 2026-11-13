import { type ReactNode, useId } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { CreatePoolAvailability } from '@ui/features/create-pool/CreatePoolAvailability'
import { FormProvider } from '@ui/features/forms'
import { DetailPageLayout } from '@ui/features/layout/DetailPageLayout/DetailPageLayout'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useActiveSection } from '@ui/hooks/useActiveSection'
import { useIsMobile } from '@ui/hooks/useBreakpoints'
import { CREATE_POOL_SECTIONS } from './constants'
import { CreatePoolLiquidity } from './CreatePoolLiquidity'
import { CreatePoolNameFields } from './CreatePoolNameFields'
import { CreatePoolParameters } from './CreatePoolParameters'
import { CreatePoolStepper } from './CreatePoolStepper'
import { CreatePoolSummary } from './CreatePoolSummary'
import { CreatePoolTokens } from './CreatePoolTokens'
import { CreatePoolType } from './CreatePoolType'
import type { CreatePoolFormProps } from './types'

const { Spacing } = SizesAndSpaces

const Section = ({ index, offset, children }: { index: number; offset: number; children: ReactNode }) => (
  <Card size="small" component="section" id={CREATE_POOL_SECTIONS[index].value} style={{ scrollMarginTop: offset }}>
    <CardHeader title={`${index + 1}. ${CREATE_POOL_SECTIONS[index].label}`} />
    <CardContent>
      <Stack sx={{ gap: Spacing.sm }}>{children}</Stack>
    </CardContent>
  </Card>
)

export const CreatePoolForm = (props: CreatePoolFormProps) => {
  const { form, onSubmit, inputsDisabled, isPending, completed, poolTypes, limits } = props
  // The mobile summary is portaled outside this form. Its submit button uses this ID to submit the page's inputs.
  const formId = useId()
  const isMobile = useIsMobile()
  const { activeSection, navigationRef, scrollOffset } = useActiveSection(CREATE_POOL_SECTIONS, {
    includeNavigationHeight: isMobile,
  })
  const { values, formState, update } = form
  const { poolType, symbol, poolName, symbol_0: firstSymbol } = values
  const selectedPoolType = poolTypes.find(type => type.id === poolType)
  const selectedPreset = selectedPoolType?.presets.find(preset => preset.id === values.preset)
  return (
    // create a custom provider/form element since the create pool form is split into page & preview/drawer
    <FormProvider {...form}>
      <Box component="form" id={formId} onSubmit={event => void onSubmit(event)} sx={{ overflowWrap: 'break-word' }}>
        <DetailPageLayout
          sidebar={
            <CreatePoolStepper
              ref={navigationRef}
              activeSection={activeSection}
              completed={completed}
              isPending={isPending}
            />
          }
          formTabs={{
            placement: 'mobile-drawer',
            content: (
              <CreatePoolSummary {...props} formId={formId} poolType={selectedPoolType} preset={selectedPreset} />
            ),
          }}
        >
          <Stack sx={{ gap: Spacing.lg, minWidth: 0 }}>
            <CreatePoolAvailability availability={props.availability} networkName={props.network.name} />
            <Section index={0} offset={scrollOffset}>
              <CreatePoolTokens {...props} />
            </Section>
            <Section index={1} offset={scrollOffset}>
              <CreatePoolType poolTypes={poolTypes} disabled={inputsDisabled} poolType={poolType} update={update} />
            </Section>
            <Section index={2} offset={scrollOffset}>
              <CreatePoolParameters
                disabled={inputsDisabled}
                ranges={limits}
                poolType={selectedPoolType}
                preset={selectedPreset}
                values={values}
                tokenSymbol={firstSymbol}
                update={update}
                errors={formState.errors}
              />
            </Section>
            <Section index={3} offset={scrollOffset}>
              <CreatePoolLiquidity {...props} />
            </Section>
            <Section index={4} offset={scrollOffset}>
              <CreatePoolNameFields
                disabled={inputsDisabled}
                nameMaxBytes={limits.nameMaxBytes}
                symbolMaxBytes={limits.symbolMaxBytes}
                poolName={poolName}
                symbol={symbol}
              />
            </Section>
          </Stack>
        </DetailPageLayout>
      </Box>
    </FormProvider>
  )
}
