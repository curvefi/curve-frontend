type SimpleFormError = {
  message: string
  ref: undefined
}

type ServerFormError = {
  code: string
  info: { key: string; args: any[] }
  operation: string
  ref: undefined
  shortMessage: string
}

export type FormError = SimpleFormError | ServerFormError
