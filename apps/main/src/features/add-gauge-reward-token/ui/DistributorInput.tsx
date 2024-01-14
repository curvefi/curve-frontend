import React from 'react'
import { useFormContext } from 'react-hook-form'
import { t } from '@lingui/macro'
import InputProvider, { InputDebounced } from '@/ui/InputComp'
import { FlexItemDistributor, SubTitle } from './styled'

export const DistributorInput: React.FC<{ disabled: boolean }> = ({ disabled }) => {
  const { setValue, formState, trigger, watch } = useFormContext()
  const distributor = watch('distributor')

  return (
    <FlexItemDistributor>
      <SubTitle>{t`Distributor`}</SubTitle>
      <InputProvider
        grid
        gridTemplateColumns="1fr auto"
        id="distributor"
        inputVariant={formState.errors.distributor ? 'error' : undefined}
        padding="var(--spacing-1) var(--spacing-1)"
      >
        <InputDebounced
          value={distributor ?? ''}
          labelProps={false}
          id="inpDistributor"
          type="text"
          onChange={(value) => setValue('distributor', value, { shouldValidate: true })}
          onBlur={() => trigger('distributor')}
          disabled={disabled}
        />
      </InputProvider>
    </FlexItemDistributor>
  )
}
