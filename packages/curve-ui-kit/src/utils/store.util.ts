export const setMissingProvider = <T extends { step: string; formProcessing?: boolean; error: string }>(slice: {
  setStateByKey: (key: 'formStatus', value: T) => void
  formStatus: T
}): undefined => {
  slice.setStateByKey('formStatus', {
    ...slice.formStatus,
    step: '',
    formProcessing: false,
    error: 'error-invalid-provider',
  })
  return
}
