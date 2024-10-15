import { create, enforce, only, type Suite } from 'vest'
import { extendEnforce } from './enforce-extension'
import { FieldName, ValidatedData } from './types'

extendEnforce(enforce)

const getFieldsList = <T extends object, F extends Extract<keyof T, string>[] = Extract<keyof T, string>[]>(
  data: T,
  fields?: F
): F => fields && fields.length > 0 ? fields : (Object.keys(data) as F)

export function checkValidity<D extends object, S extends Suite<any, any>>(
  suite: S,
  data: D,
  fields?: Extract<keyof D, string>[]
): boolean {
  const fieldsList = getFieldsList(data, fields)
  const result = suite(data, fieldsList)
  return fieldsList.every((field) => result.getErrors(field).length === 0)
}

export function assertValidity<D extends object, S extends Suite<any, any>>(
  suite: S,
  data: D,
  fields?: Extract<keyof D, string>[]
): ValidatedData<D> {
  const fieldsList = getFieldsList(data, fields)
  const result = suite(data, fieldsList)
  const errors = fieldsList.flatMap((field) => result.getErrors(field))
  if (errors.length > 0) {
    throw new Error('Validation failed: ' + errors.join(', '))
  }
  return data as ValidatedData<D>
}

export const createValidationSuite = <
  T extends object,
  TGroupName extends string = string
>(validationGroup: (data: T) => void): Suite<FieldName<T>, TGroupName> =>
  create<FieldName<T>, TGroupName>((data: T, fieldsList?: FieldName<T>[]) => {
    only(fieldsList)
    validationGroup(data)
  })
