import { type ValidatedData } from './types'
import { create, enforce, only, type Suite } from 'vest'
import { extendEnforce } from './enforce-extension'

extendEnforce(enforce)

function getFieldsList<T extends object, F extends Extract<keyof T, string>[] = Extract<keyof T, string>[]>(
  data: T,
  fields?: F,
): F {
  return fields && fields.length > 0 ? fields : (Object.keys(data) as F)
}

export function checkValidity<D extends object, S extends Suite<any, any>>(
  suite: S,
  data: D,
  fields?: Extract<keyof D, string>[],
): boolean {
  const fieldsList = getFieldsList(data, fields)
  const result = suite(data, fieldsList)
  const errors = fieldsList.map((field) => result.getErrors(field)).flat()
  return errors.length === 0
}

export function assertValidity<D extends object, S extends Suite<any, any>>(
  suite: S,
  data: D,
  fields?: Extract<keyof D, string>[],
): ValidatedData<D> {
  const fieldsList = getFieldsList(data, fields)
  const result = suite(data, fieldsList)
  const errors = fieldsList.map((field) => result.getErrors(field)).flat()
  if (errors.length > 0) {
    throw new Error('Validation failed: ' + errors.join(', '))
  }
  return data as ValidatedData<D>
}

export function createValidationSuite<
  T extends object,
  F extends Extract<keyof T, string>[] = Extract<keyof T, string>[],
>(validationGroup: (data: T) => void) {
  return create((data: T, fieldsList?: F) => {
    only(fieldsList)
    validationGroup(data)
  })
}
