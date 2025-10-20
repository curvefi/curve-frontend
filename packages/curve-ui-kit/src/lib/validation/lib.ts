import { FieldName, FieldsOf } from './types'

// Minimal, self-written validation utilities to replace 'vest'.

type ErrorsMap = Record<string, string>

type TestCallback = () => void

type SuiteResult = {
  getErrors(): ErrorsMap
}

// Suite: validation function that can optionally accept a list of fields to validate by name.
// For compatibility across call sites, the 'fields' parameter is typed as generic string[].
// This keeps things flexible while still allowing callers to narrow TField for their domain types.
export type Suite<TField extends string, _TGroup extends string = string> = (
  data: any,
  fields?: string[],
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
      ctx.errors[field] = messageOverride || (err instanceof Error ? err.message : 'Invalid value')
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
  isNumeric: () => EnforceChain
  gt: (expected: number | string) => EnforceChain
  gte: (expected: number | string) => EnforceChain
  lt: (expected: number | string) => EnforceChain
  lte: (expected: number | string) => EnforceChain
  condition: <V = unknown>(cb: (value: V) => { pass: boolean; message: string | (() => string) }) => EnforceChain
  isDecimal: (options?: { decimal_digits?: string }) => EnforceChain
  isAddress: () => EnforceChain
  isNotZeroAddress: () => EnforceChain
  isPositiveNumber: () => EnforceChain
  isValidChainId: () => EnforceChain
  isValidChainName: () => EnforceChain
  isNotNull: () => EnforceChain
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

const toFiniteNumber = (v: unknown): number | null => {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null
  if (typeof v === 'string') {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
  }
  return null
}

const makeChain = (value: unknown) => {
  let nextMessage: string | undefined
  const chain: EnforceChain = {
    message(msg: string) {
      nextMessage = msg
      return chain
    },
    condition<V = unknown>(cb: (value: V) => { pass: boolean; message: string | (() => string) }) {
      const { pass, message } = cb(value as V)
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
    isNumeric() {
      runCheck(toFiniteNumber(value) !== null, 'Must be a numeric value', nextMessage)
      nextMessage = undefined
      return chain
    },
    gt(expected: number | string) {
      const n = toFiniteNumber(value)
      const e = toFiniteNumber(expected)
      runCheck(n !== null && e !== null && n > e, 'Must be greater than expected value', nextMessage)
      nextMessage = undefined
      return chain
    },
    gte(expected: number | string) {
      const n = toFiniteNumber(value)
      const e = toFiniteNumber(expected)
      runCheck(n !== null && e !== null && n >= e, 'Must be greater than or equal to expected value', nextMessage)
      nextMessage = undefined
      return chain
    },
    lt(expected: number | string) {
      const n = toFiniteNumber(value)
      const e = toFiniteNumber(expected)
      runCheck(n !== null && e !== null && n < e, 'Must be less than expected value', nextMessage)
      nextMessage = undefined
      return chain
    },
    lte(expected: number | string) {
      const n = toFiniteNumber(value)
      const e = toFiniteNumber(expected)
      runCheck(n !== null && e !== null && n <= e, 'Must be less than or equal to expected value', nextMessage)
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
    isNotNull() {
      runCheck(value !== null && value !== undefined, 'Must not be null', nextMessage)
      nextMessage = undefined
      return chain
    },
  }

  return chain
}

export const enforce = (value: unknown) => makeChain(value)

export const checkValidity = <D extends object, TField extends string, TGroup extends string = string>(
  suite: Suite<TField, TGroup>,
  data: FieldsOf<D>,
  fields?: TField[],
): boolean => Object.keys(suite(data, fields).getErrors()).length === 0

export function assertValidity<D extends object, S extends Suite<string>>(
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
  ((data: T, fieldsList?: string[]) => {
    const ctx: ValidationContext<FieldName<T>> = {
      errors: {},
      // Cast string[] to Set<FieldName<T>> to keep runtime flexible while preserving type information internally
      onlyFields: fieldsList ? (new Set(fieldsList) as unknown as Set<FieldName<T>>) : undefined,
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
