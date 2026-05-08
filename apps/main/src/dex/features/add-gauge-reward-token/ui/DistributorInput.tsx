import type { AddRewardFormValues } from '@/dex/features/add-gauge-reward-token/types'
import type { Address } from '@primitives/address.utils'
import { InputDebounced, InputProvider } from '@ui/InputComp'
import { useFormContext } from '@ui-kit/features/forms'
import { t } from '@ui-kit/lib/i18n'
import { FlexItemDistributor, SubTitle } from './styled'

export const DistributorInput = ({ disabled }: { disabled: boolean }) => {
  const { updateForm, formState, trigger, watchValue } = useFormContext<AddRewardFormValues>()
  const distributorId = watchValue('distributorId')

  return (
    <FlexItemDistributor>
      <SubTitle>{t`Distributor`}</SubTitle>
      <InputProvider
        grid
        gridTemplateColumns="1fr auto"
        id="distributor"
        inputVariant={formState.errors.distributorId ? 'error' : undefined}
        padding="var(--spacing-1) var(--spacing-1)"
      >
        <InputDebounced
          value={distributorId ?? ''}
          labelProps={false}
          id="inpDistributor"
          type="text"
          onChange={value => updateForm({ distributorId: value as Address })}
          onBlur={() => trigger('distributorId')}
          disabled={disabled}
        />
      </InputProvider>
    </FlexItemDistributor>
  )
}
