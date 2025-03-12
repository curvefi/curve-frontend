import { ChainQuery } from '@ui-kit/lib/model/query'
import { FieldsOf } from '@ui-kit/lib/validation'

export type TokenQuery = ChainQuery & { tokenAddress: string }
export type TokenParams = FieldsOf<TokenQuery>
