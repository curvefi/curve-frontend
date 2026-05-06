import { useForm } from 'react-hook-form'
import { vestResolver } from '@hookform/resolvers/vest'
import { t } from '@ui-kit/lib/i18n'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model'
import { useFormErrors, useFormSync } from '@ui-kit/utils/react-form.utils'
import { useCreateVoteMutation } from './create-vote.mutation'
import { createVoteFormValidationSuite } from './create-vote.validation'

export type CreateVoteForm = {
  gaugeAddress: string
  description: string
}

const defaultValues: CreateVoteForm = {
  gaugeAddress: '',
  description: t`Add a gauge for the following pool: `,
} satisfies CreateVoteForm

export const useCreateVoteForm = ({ gauge, onSuccess }: { gauge: string; onSuccess: () => void }) => {
  const form = useForm<CreateVoteForm>({
    ...formDefaultOptions,
    resolver: vestResolver(createVoteFormValidationSuite),
    defaultValues,
  })

  useFormSync(form, { gaugeAddress: gauge.toLowerCase() })

  const {
    onSubmit: onSubmitCreateVote,
    error: createVoteError,
    isPending: isCreatingVote,
  } = useCreateVoteMutation({ onReset: onSuccess })

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
    createVoteError,
    formErrors,
  }
}
