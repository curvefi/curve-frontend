import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useConnection } from 'wagmi'
import { formDefaultOptions, watchForm } from '@ui-kit/lib/model/form'

export type SubmitErrorContactMethod = 'email' | 'telegram' | 'discord'

export type SubmitErrorReportFormValues = {
  address: string
  contactMethod: SubmitErrorContactMethod
  contact: string
  description: string
}

export const useSubmitErrorReportForm = () => {
  const { address: userAddress } = useConnection()
  const form = useForm<SubmitErrorReportFormValues>({
    ...formDefaultOptions,
    defaultValues: {
      address: userAddress ?? '',
      contactMethod: 'email',
      contact: '',
      description: '',
    },
  })

  useEffect(() => {
    if (!userAddress) return
    if (form.getValues('address')) return
    form.setValue('address', userAddress, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: false,
    })
  }, [form, userAddress])

  const values = watchForm(form)
  const onSubmit = form.handleSubmit((data) => {
    console.info(data)
  })

  return {
    form,
    values,
    onSubmit,
  }
}
