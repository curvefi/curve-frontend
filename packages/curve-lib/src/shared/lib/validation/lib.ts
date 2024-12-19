import { create, enforce, only, type Suite } from 'vest'
import { extendEnforce } from './enforce-extension'
import { FieldName, FieldsOf } from './types'

extendEnforce(enforce)

export const checkValidity = <D extends object, S extends Suite<any, any>>(
  suite: S,
  data: FieldsOf<D>,
  fields?: FieldName<D>[],
): boolean => Object.keys(suite(data, fields).getErrors()).length === 0

export function assertValidity<D extends object, S extends Suite<any, any>>(
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
  create<FieldName<T>, TGroupName>((data: T, fieldsList?: FieldName<T>[]) => {
    only(fieldsList)
    validationGroup(data)
  })
