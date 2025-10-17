import { FieldName, FieldsOf } from './types'

// Minimal, self-written validation utilities to replace 'vest'.

type ErrorsMap = Record<string, string>

type TestCallback = () => void

type SuiteResult = {
  getErrors(): ErrorsMap
}

export type Suite<TField extends string, _TGroup extends string = string, _TCb = unknown> = (
  data: any,
  fields?: TField[],
) => SuiteResult

type ValidationContext<TField extends string> = {
  errors: ErrorsMap
  onlyFields?: Set<TField>
}

let currentContext: ValidationContext<any> | null = null

// group is a simple structured executor; it just runs the callback.
export const group = (_groupName: string, cb: () => void) => cb()

// test supports two signatures: (field, cb) and (field, message, cb)
export function test<TField extends string>(field: TField, cb: TestCallback): void
export function test<TField extends string>(field: TField, message: string, cb: TestCallback): void
export function test<TField extends string>(
  field: TField,
  messageOrCb: string | TestCallback,
  cbMaybe?: TestCallback,
): void {
  if (!currentContext) return
  const ctx = currentContext as ValidationContext<TField>
  const onlyFields = ctx.onlyFields
  if (onlyFields && !onlyFields.has(field)) return

  const cb = typeof messageOrCb === 'function' ? messageOrCb : cbMaybe!
  const messageOverride = typeof messageOrCb === 'string' ? messageOrCb : undefined

  try {
    cb()
  } catch (err) {
    if (!(field in ctx.errors)) {
      const msg = messageOverride || (err instanceof Error ? err.message : 'Invalid value')
      ctx.errors[field] = msg
    }
  }
}

// enforce implementation with simple chainable validators and extensibility.
type EnforceChain = {
  message: (msg: string) => EnforceChain
  equals: (expected: any) => EnforceChain
  isTrue: () => EnforceChain
  isNotEmpty: () => EnforceChain
  isNumber: () => EnforceChain
  condition: (cb: (value: unknown) => { pass: boolean; message: string | (() => string) }) => EnforceChain
  isDecimal: (options?: { decimal_digits?: string }) => EnforceChain
  isAddress: () => EnforceChain
  isNotZeroAddress: () => EnforceChain
  isPositiveNumber: () => EnforceChain
  isValidChainId: () => EnforceChain
  isValidChainName: () => EnforceChain
}

const runCheck = (ok: boolean, defaultMessage: string, nextMessage?: string): void => {
  if (!ok) throw new Error(nextMessage || defaultMessage)
}

// Helpers for validators
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
const isHexStrict = (s: string) => /^0x[0-9a-fA-F]+$/.test(s)
const isEvmAddress = (value: unknown): value is string =>
  typeof value === 'string' && value.length === 42 && isHexStrict(value)

// Copied and adapted from validator.js isDecimal; minimal for our needs
const isDecimal = (value: unknown, options?: { decimal_digits?: string }): boolean => {
  if (typeof value !== 'string') return false
  const decimal_digits = options?.decimal_digits || '1,'
  const blacklist = ['', '-', '+']
  const cleanStr = value.replace(/ /g, '')
  if (blacklist.includes(cleanStr)) return false
  return new RegExp(`^[-+]?([0-9]+)?(\\.[0-9]{${decimal_digits}})?$`).test(value)
}

const makeChain = (value: unknown) => {
  let nextMessage: string | undefined
  const chain: EnforceChain = {
    message(msg: string) {
      nextMessage = msg
      return chain
    },
    condition(cb: (value: unknown) => { pass: boolean; message: string | (() => string) }) {
      const { pass, message } = cb(value)
      const msg = typeof message === 'function' ? message() : message
      runCheck(pass, msg || 'Invalid value', nextMessage)
      nextMessage = undefined
      return chain
    },
    equals(expected: any) {
      runCheck(value === expected, 'Must be equal to expected value', nextMessage)
      nextMessage = undefined
      return chain
    },
    isTrue() {
      runCheck(value === true, 'Must be true', nextMessage)
      nextMessage = undefined
      return chain
    },
    isNotEmpty() {
      let ok = true
      if (value === null || value === undefined) ok = false
      else if (typeof value === 'string') ok = value.trim().length > 0
      else if (Array.isArray(value)) ok = value.length > 0
      runCheck(ok, 'Must not be empty', nextMessage)
      nextMessage = undefined
      return chain
    },
    isNumber() {
      runCheck(typeof value === 'number' && Number.isFinite(value), 'Must be a number', nextMessage)
      nextMessage = undefined
      return chain
    },
    isDecimal(options?: { decimal_digits?: string }) {
      runCheck(isDecimal(value, options), 'Must be a valid decimal number', nextMessage)
      nextMessage = undefined
      return chain
    },
    isAddress() {
      runCheck(!!value && isEvmAddress(value), 'Must be a valid Ethereum address', nextMessage)
      nextMessage = undefined
      return chain
    },
    isNotZeroAddress() {
      runCheck(value !== ZERO_ADDRESS, 'Address cannot be the zero address', nextMessage)
      nextMessage = undefined
      return chain
    },
    isPositiveNumber() {
      runCheck(typeof value === 'number' && value > 0, 'Must be a positive number', nextMessage)
      nextMessage = undefined
      return chain
    },
    isValidChainId() {
      runCheck(typeof value === 'number', 'Must be a valid chain ID', nextMessage)
      nextMessage = undefined
      return chain
    },
    isValidChainName() {
      runCheck(typeof value === 'string', 'Must be a valid chain name', nextMessage)
      nextMessage = undefined
      return chain
    },
  }

  return chain
}

export const enforce = (value: unknown) => makeChain(value)

export const checkValidity = <D extends object, S extends Suite<any, any, any>>(
  suite: S,
  data: FieldsOf<D>,
  fields?: FieldName<D>[],
): boolean => Object.keys(suite(data, fields).getErrors()).length === 0

export function assertValidity<D extends object, S extends Suite<any, any, any>>(
  suite: S,
  data: FieldsOf<D>,
  fields?: FieldName<D>[],
): D {
  const result = suite(data, fields)
  const entries = Object.entries(result.getErrors())
  if (entries.length > 0) {
    throw new Error(`Validation failed: ${entries.map(([field, error]) => `${field}: ${error}`).join(', ')}`)
  }
  return data as D
}

export const createValidationSuite = <T extends object, TGroupName extends string = string>(
  validationGroup: (data: T) => void,
): Suite<FieldName<T>, TGroupName> =>
  ((data: T, fieldsList?: FieldName<T>[]) => {
    const ctx: ValidationContext<FieldName<T>> = {
      errors: {},
      onlyFields: fieldsList ? new Set(fieldsList) : undefined,
    }
    currentContext = ctx
    try {
      validationGroup(data)
    } finally {
      currentContext = null
    }
    const result: SuiteResult = {
      getErrors: () => ctx.errors,
    }
    return result
  }) as Suite<FieldName<T>, TGroupName>

export const EmptyValidationSuite = createValidationSuite(() => {})
