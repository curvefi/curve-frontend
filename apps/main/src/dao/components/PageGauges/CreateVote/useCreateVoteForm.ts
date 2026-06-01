import { useForm, useFormSync } from '@ui-kit/features/forms'
import { usePinataJwt } from '@ui-kit/hooks/useLocalStorage'
import type { FieldsOf } from '@ui-kit/lib'
import { t } from '@ui-kit/lib/i18n'
import { useCreateVoteMutation } from './create-vote.mutation'
import { createVoteFormValidationSuite } from './create-vote.validation'

export interface CreateVoteMutation {
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

export const useCreateVoteForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const form = useForm<CreateVoteForm>({ validation: createVoteFormValidationSuite, defaultValues })

  const [storedJwt] = usePinataJwt()

  useFormSync(form, { pinataJwt: storedJwt })

  const {
    onSubmit: onSubmitCreateVote,
    error: createVoteError,
    isPending: isCreatingVote,
  } = useCreateVoteMutation({
    onReset: () => {
      form.reset(defaultValues)
      form.update({ pinataJwt: storedJwt })
      onSuccess()
    },
  })

  const { formState } = form
  const formErrors = formState.visibleErrors

  const isPending = formState.isSubmitting || isCreatingVote

  return {
    form,
    values: form.watchValues(),
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
