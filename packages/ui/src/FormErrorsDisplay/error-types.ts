interface SimpleFormError {
  message: string
  ref: undefined
}

interface ServerFormError {
  code: string
  info: { key: string; args: unknown[] }
  operation: string
  ref: undefined
  shortMessage: string
}

export type FormError = SimpleFormError | ServerFormError
