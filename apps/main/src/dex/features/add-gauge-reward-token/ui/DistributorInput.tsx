import type { AddRewardFormValues } from '@/dex/features/add-gauge-reward-token/types'
import { useFormContext } from '@evm-ui/features/forms'
import { t } from '@evm-ui/lib/i18n'
import { InputDebounced, InputProvider } from '@legacy-ui/InputComp'
import type { Address } from '@primitives/address.utils'
import { FlexItemDistributor, SubTitle } from './styled'

export const DistributorInput = ({ disabled }: { disabled: boolean }) => {
  const { update: updateForm, formState, watchValue } = useFormContext<AddRewardFormValues>()
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
          disabled={disabled}
        />
      </InputProvider>
    </FlexItemDistributor>
  )
}
