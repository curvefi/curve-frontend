import { useForm } from 'react-hook-form'
import { vestResolver } from '@hookform/resolvers/vest'
import { usePinataJwt } from '@ui-kit/hooks/useLocalStorage'
import type { FieldsOf } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model'
import { resetForm, updateForm, useFormErrors, useFormSync } from '@ui-kit/utils/react-form.utils'
import { useCreateVoteMutation } from './create-vote.mutation'
import { createVoteFormValidationSuite } from './create-vote.validation'

export type CreateVoteMutation = {
  gaugeAddress: string
  description: string
  pinataJwt: string
}

export type CreateVoteForm = FieldsOf<CreateVoteMutation>

const defaultValues: CreateVoteForm = {
  gaugeAddress: undefined,
  description: t`Add a gauge for the following pool: `,
  pinataJwt: undefined,
} satisfies CreateVoteForm

export const useCreateVoteForm = ({ gauge, onSuccess }: { gauge: string; onSuccess: () => void }) => {
  const form = useForm<CreateVoteForm>({
    ...formDefaultOptions,
    resolver: vestResolver(createVoteFormValidationSuite),
    defaultValues,
  })

  const [storedJwt] = usePinataJwt()

  useFormSync(form, { gaugeAddress: gauge.toLowerCase(), pinataJwt: storedJwt })

  const {
    onSubmit: onSubmitCreateVote,
    error: createVoteError,
    isPending: isCreatingVote,
  } = useCreateVoteMutation({
    onReset: () => {
      resetForm(form, defaultValues)
      updateForm(form, { pinataJwt: storedJwt })
      onSuccess()
    },
  })

  const { formState } = form
  const formErrors = useFormErrors(formState)

  const isPending = formState.isSubmitting || isCreatingVote

  return {
    form,
    values: watchForm(form),
    isPending,
    isDisabled: !formState.isValid || isPending,

    onSubmit: form.handleSubmit(onSubmitCreateVote),

    // Errors
    gaugeAddressError: formErrors.find(([f]) => f === 'gaugeAddress')?.[1],
    descriptionError: formErrors.find(([f]) => f === 'description')?.[1],
    pinataJwtError: formErrors.find(([f]) => f === 'pinataJwt')?.[1],
    createVoteError,
    formErrors,
  }
}
